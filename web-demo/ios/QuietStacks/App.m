#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>
#import <sys/utsname.h>

// Give bundled web assets a single origin, without opening a network port or
// relaxing WebKit's file-access settings. Only files inside web/ are served.
@interface GalleryAssets : NSObject <WKURLSchemeHandler>
@end
@implementation GalleryAssets
- (void)webView:(WKWebView *)webView startURLSchemeTask:(id<WKURLSchemeTask>)task {
    NSURL *url=task.request.URL;
    NSURL *root=[NSBundle.mainBundle.resourceURL URLByAppendingPathComponent:@"web" isDirectory:YES];
    NSString *relative=url.path.stringByRemovingPercentEncoding;
    if ([relative hasPrefix:@"/"]) relative=[relative substringFromIndex:1];
    if (relative.length==0) relative=@"index.html";
    NSURL *file=[[root URLByAppendingPathComponent:relative] URLByStandardizingPath];
    if (![url.host isEqualToString:@"localhost"] || ![file.path hasPrefix:[root.path stringByAppendingString:@"/"]]) {
        [task didFailWithError:[NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorNoPermissionsToReadFile userInfo:nil]];return;
    }
    NSError *error=nil;NSData *data=[NSData dataWithContentsOfURL:file options:NSDataReadingMappedIfSafe error:&error];
    if(!data){[task didFailWithError:error];return;}
    NSDictionary *types=@{@"html":@"text/html; charset=utf-8",@"js":@"application/javascript; charset=utf-8",@"css":@"text/css; charset=utf-8",@"png":@"image/png",@"svg":@"image/svg+xml",@"json":@"application/json"};
    NSString *mime=types[file.pathExtension.lowercaseString] ?: @"application/octet-stream";
    NSHTTPURLResponse *response=[[NSHTTPURLResponse alloc] initWithURL:url statusCode:200 HTTPVersion:@"HTTP/1.1" headerFields:@{@"Content-Type":mime,@"Content-Length":[NSString stringWithFormat:@"%lu",(unsigned long)data.length],@"Access-Control-Allow-Origin":@"*"}];
    [task didReceiveResponse:response];[task didReceiveData:data];[task didFinish];
}
- (void)webView:(WKWebView *)webView stopURLSchemeTask:(id<WKURLSchemeTask>)task {}
@end

@interface GalleryController : UIViewController <WKNavigationDelegate, WKScriptMessageHandler>
@property(nonatomic, strong) WKWebView *webView;
@property(nonatomic, strong) UIView *loadingPanel;
@property(nonatomic, strong) UILabel *loadingLabel;
@property(nonatomic, strong) UIButton *retryButton;
@property(nonatomic, strong) UIButton *copyButton;
@property(nonatomic, strong) UITextView *diagnosticView;
@property(nonatomic, strong) NSMutableArray *diagnosticEvents;
@property(nonatomic, strong) NSDictionary *firstFailure;
@property(nonatomic, copy) NSString *diagnosticReport;
@property(nonatomic) NSTimeInterval launchTime;
@property(nonatomic) NSInteger memoryWarnings;
@property(nonatomic) NSInteger launchGeneration;
@property(nonatomic) NSInteger processTerminations;
@property(nonatomic) BOOL galleryReady;
@end

@implementation GalleryController
- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor colorWithRed:23/255.0 green:18/255.0 blue:14/255.0 alpha:1];
    WKWebViewConfiguration *configuration = [WKWebViewConfiguration new];
    [configuration setURLSchemeHandler:[GalleryAssets new] forURLScheme:@"quietstacks"];
    [configuration.userContentController addScriptMessageHandler:self name:@"galleryStatus"];
    NSString *bridgePath=[NSBundle.mainBundle.resourcePath stringByAppendingPathComponent:@"web/js/gallery-diagnostics.js"];
    NSString *failureBridge=[NSString stringWithContentsOfFile:bridgePath encoding:NSUTF8StringEncoding error:nil];
    if(!failureBridge)failureBridge=@"window.webkit.messageHandlers.galleryStatus.postMessage({type:'diagnostic',kind:'resource-error',asset:'js/gallery-diagnostics.js',message:'Diagnostic bridge missing from app bundle'});";
    [configuration.userContentController addUserScript:[[WKUserScript alloc] initWithSource:failureBridge injectionTime:WKUserScriptInjectionTimeAtDocumentStart forMainFrameOnly:YES]];
#if TARGET_OS_SIMULATOR
    if ([NSProcessInfo.processInfo.arguments containsObject:@"--gallery-smoke"]) {
        NSString *diagnostics = @"window.__galleryBootSaved=null;try{window.__galleryBootSaved=localStorage.getItem('quiet-stacks.gallery.v4');}catch{}window.__galleryErrors=[];const originalError=console.error;console.error=(...a)=>{window.__galleryErrors.push(a.map(String).join(' '));originalError.apply(console,a);};window.addEventListener('error',e=>window.__galleryErrors.push(e.message));";
        [configuration.userContentController addUserScript:[[WKUserScript alloc] initWithSource:diagnostics injectionTime:WKUserScriptInjectionTimeAtDocumentStart forMainFrameOnly:YES]];
        [self performSelector:@selector(pollSmoke) withObject:nil afterDelay:1];
    }
#endif
    configuration.websiteDataStore = WKWebsiteDataStore.defaultDataStore;
    self.webView = [[WKWebView alloc] initWithFrame:CGRectZero configuration:configuration];
    self.webView.navigationDelegate = self;
    self.webView.opaque = NO;
    self.webView.backgroundColor = self.view.backgroundColor;
    self.webView.scrollView.scrollEnabled = NO;
    self.webView.scrollView.bounces = NO;
    self.webView.scrollView.pinchGestureRecognizer.enabled = NO;
    self.webView.scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    self.webView.translatesAutoresizingMaskIntoConstraints = NO;
    [self.view addSubview:self.webView];
    UILayoutGuide *safe = self.view.safeAreaLayoutGuide;
    [NSLayoutConstraint activateConstraints:@[
        [self.webView.leadingAnchor constraintEqualToAnchor:safe.leadingAnchor],
        [self.webView.trailingAnchor constraintEqualToAnchor:safe.trailingAnchor],
        [self.webView.topAnchor constraintEqualToAnchor:safe.topAnchor],
        [self.webView.bottomAnchor constraintEqualToAnchor:safe.bottomAnchor]
    ]];
    self.loadingPanel=[UIView new];self.loadingPanel.backgroundColor=self.view.backgroundColor;self.loadingPanel.translatesAutoresizingMaskIntoConstraints=NO;
    self.loadingLabel=[UILabel new];self.loadingLabel.textColor=[UIColor colorWithRed:0.88 green:0.75 blue:0.51 alpha:1];self.loadingLabel.font=[UIFont systemFontOfSize:20 weight:UIFontWeightMedium];self.loadingLabel.numberOfLines=0;self.loadingLabel.textAlignment=NSTextAlignmentCenter;
    self.retryButton=[UIButton buttonWithType:UIButtonTypeSystem];[self.retryButton setTitle:@"Reload gallery" forState:UIControlStateNormal];self.retryButton.tintColor=self.loadingLabel.textColor;[self.retryButton addTarget:self action:@selector(loadGallery) forControlEvents:UIControlEventTouchUpInside];
    self.copyButton=[UIButton buttonWithType:UIButtonTypeSystem];[self.copyButton setTitle:@"Copy diagnostic" forState:UIControlStateNormal];self.copyButton.tintColor=self.loadingLabel.textColor;[self.copyButton addTarget:self action:@selector(copyDiagnostic) forControlEvents:UIControlEventTouchUpInside];
    self.diagnosticView=[UITextView new];self.diagnosticView.editable=NO;self.diagnosticView.selectable=YES;self.diagnosticView.backgroundColor=[UIColor colorWithWhite:0.08 alpha:1];self.diagnosticView.textColor=[UIColor colorWithWhite:0.9 alpha:1];self.diagnosticView.font=[UIFont monospacedSystemFontOfSize:12 weight:UIFontWeightRegular];
    [self.diagnosticView.heightAnchor constraintEqualToConstant:116].active=YES;
    UIStackView *actions=[[UIStackView alloc] initWithArrangedSubviews:@[self.copyButton,self.retryButton]];actions.axis=UILayoutConstraintAxisHorizontal;actions.spacing=24;actions.distribution=UIStackViewDistributionFillEqually;
    [actions.heightAnchor constraintGreaterThanOrEqualToConstant:44].active=YES;
    UIStackView *stack=[[UIStackView alloc] initWithArrangedSubviews:@[self.loadingLabel,self.diagnosticView,actions]];stack.axis=UILayoutConstraintAxisVertical;stack.spacing=12;stack.translatesAutoresizingMaskIntoConstraints=NO;
    [self.view addSubview:self.loadingPanel];[self.loadingPanel addSubview:stack];
    [NSLayoutConstraint activateConstraints:@[[self.loadingPanel.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],[self.loadingPanel.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],[self.loadingPanel.topAnchor constraintEqualToAnchor:self.view.topAnchor],[self.loadingPanel.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor],[stack.centerXAnchor constraintEqualToAnchor:self.loadingPanel.centerXAnchor],[stack.centerYAnchor constraintEqualToAnchor:self.loadingPanel.centerYAnchor],[stack.widthAnchor constraintEqualToAnchor:self.loadingPanel.widthAnchor multiplier:0.8]]];
    [self loadGallery];
}
- (void)loadGallery {
    self.galleryReady=NO;self.firstFailure=nil;self.diagnosticEvents=[NSMutableArray new];self.launchTime=NSProcessInfo.processInfo.systemUptime;self.memoryWarnings=0;self.processTerminations=0;
    self.loadingPanel.hidden=NO;self.loadingLabel.text=@"Opening the gallery…";self.retryButton.hidden=YES;self.copyButton.hidden=YES;self.diagnosticView.hidden=YES;
    [self.copyButton setTitle:@"Copy diagnostic" forState:UIControlStateNormal];
    NSInteger generation=++self.launchGeneration;
    [self.webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"quietstacks://localhost/index.html"]]];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW,45*NSEC_PER_SEC),dispatch_get_main_queue(),^{if(generation==self.launchGeneration&&!self.galleryReady&&!self.firstFailure)[self failWithKind:@"startup-timeout" details:@{@"message":@"No rendered frame after 45 seconds"}];});
}
- (NSDictionary *)recordKind:(NSString *)kind details:(NSDictionary *)details {
    NSMutableDictionary *event=[NSMutableDictionary dictionaryWithDictionary:details];event[@"kind"]=kind;event[@"elapsedMs"]=@((NSInteger)((NSProcessInfo.processInfo.systemUptime-self.launchTime)*1000));
    [self.diagnosticEvents addObject:event];if(self.diagnosticEvents.count>24)[self.diagnosticEvents removeObjectAtIndex:0];return event;
}
- (void)failWithKind:(NSString *)kind details:(NSDictionary *)details {
    NSDictionary *event=[self recordKind:kind details:details];if(!self.firstFailure)self.firstFailure=event;
    struct utsname hardware;uname(&hardware);
    NSDictionary *report=@{@"app":@"Quiet Stacks",@"version":[NSBundle.mainBundle objectForInfoDictionaryKey:@"CFBundleShortVersionString"] ?: @"unknown",@"build":[NSBundle.mainBundle objectForInfoDictionaryKey:@"CFBundleVersion"] ?: @"unknown",@"iOS":UIDevice.currentDevice.systemVersion,@"hardware":[NSString stringWithUTF8String:hardware.machine],@"firstFailure":self.firstFailure,@"memoryWarnings":@(self.memoryWarnings),@"processTerminations":@(self.processTerminations),@"events":[self.diagnosticEvents copy]};
    NSData *json=[NSJSONSerialization dataWithJSONObject:report options:NSJSONWritingPrettyPrinted error:nil];self.diagnosticReport=[[NSString alloc] initWithData:json encoding:NSUTF8StringEncoding];
    NSString *directory=NSSearchPathForDirectoriesInDomains(NSCachesDirectory,NSUserDomainMask,YES).firstObject;[json writeToFile:[directory stringByAppendingPathComponent:@"gallery-last-diagnostic.json"] atomically:YES];
    self.galleryReady=NO;self.loadingPanel.hidden=NO;self.loadingLabel.text=[NSString stringWithFormat:@"The gallery could not stay open.\n%@",self.firstFailure[@"kind"]];self.retryButton.hidden=NO;self.copyButton.hidden=NO;self.diagnosticView.hidden=NO;self.diagnosticView.text=self.diagnosticReport;
#if TARGET_OS_SIMULATOR
    if([NSProcessInfo.processInfo.arguments containsObject:@"--gallery-diagnostic-smoke"]&&[self.firstFailure[@"message"] isEqual:@"QUIET_STACKS_DIAGNOSTIC_PROBE"]){
        [self.copyButton sendActionsForControlEvents:UIControlEventTouchUpInside];
        NSDictionary *probe=@{@"report":report,@"copyVerified":@([UIPasteboard.generalPasteboard.string isEqualToString:self.diagnosticReport]),@"overlayVisible":@(!self.loadingPanel.hidden&&!self.copyButton.hidden&&!self.diagnosticView.hidden)};
        NSString *documents=NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask,YES).firstObject;[[NSJSONSerialization dataWithJSONObject:probe options:NSJSONWritingPrettyPrinted error:nil] writeToFile:[documents stringByAppendingPathComponent:@"gallery-diagnostic-probe.json"] atomically:YES];
    }
#endif
}
- (void)copyDiagnostic {
    if(self.diagnosticReport.length){UIPasteboard.generalPasteboard.string=self.diagnosticReport;[self.copyButton setTitle:@"Diagnostic copied" forState:UIControlStateNormal];}
}
- (void)userContentController:(WKUserContentController *)controller didReceiveScriptMessage:(WKScriptMessage *)message {
    if(!message.frameInfo.isMainFrame)return;
    NSString *kind=nil;NSMutableDictionary *details=[NSMutableDictionary new];
    if([message.body isKindOfClass:NSDictionary.class]&&[message.body[@"type"] isEqual:@"diagnostic"]){
        id value=message.body[@"kind"];if([value isKindOfClass:NSString.class])kind=[value substringToIndex:MIN((NSUInteger)60,[value length])];
        for(NSString *key in @[@"message",@"stage",@"status",@"stack",@"asset",@"line",@"column",@"loaded",@"total"]){id v=message.body[key];if([v isKindOfClass:NSString.class])details[key]=[v substringToIndex:MIN((NSUInteger)1200,[v length])];else if([v isKindOfClass:NSNumber.class])details[key]=v;}
    }else if([message.body isEqual:@"ready"])kind=@"ready";else if([message.body isEqual:@"error"])kind=@"javascript-error";
    if(!kind)return;
    if([@[@"javascript-error",@"resource-error",@"promise-rejection",@"asset-error"] containsObject:kind]){[self failWithKind:kind details:details];return;}
    [self recordKind:kind details:details];
    if([kind isEqual:@"ready"]&&!self.firstFailure){self.galleryReady=YES;self.loadingPanel.hidden=YES;
#if TARGET_OS_SIMULATOR
        if([NSProcessInfo.processInfo.arguments containsObject:@"--gallery-diagnostic-smoke"])[self.webView evaluateJavaScript:@"setTimeout(function(){throw new Error('QUIET_STACKS_DIAGNOSTIC_PROBE');},0)" completionHandler:nil];
#endif
    }
}
- (void)navigationFailure:(NSError *)error {
    if([error.domain isEqual:NSURLErrorDomain]&&error.code==NSURLErrorCancelled)return;
    [self failWithKind:@"navigation-error" details:@{@"domain":error.domain,@"code":@(error.code),@"message":error.localizedDescription}];
}
- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {[self navigationFailure:error];}
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {[self navigationFailure:error];}
- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];self.memoryWarnings++;[self recordKind:@"memory-warning" details:@{@"message":@"iOS notified the app of memory pressure"}];
}
#if TARGET_OS_SIMULATOR
- (void)pollSmoke {
    NSString *script = @"(()=>{if(window.__galleryRenderedFrames>0){window.__qaTicks=(window.__qaTicks||0)+1;if(window.__qaTicks===5)document.getElementById('demo-sort').click();if(window.__qaTicks===11){document.getElementById('demo-scatter').click();document.getElementById('plus').click();}}let saved=null,storageError=null;try{saved=JSON.parse(localStorage.getItem('quiet-stacks.gallery.v4')||'null');}catch(e){storageError=e.message;}if(saved){if(saved.books.filter(b=>b.place==='shelf').length===525)window.__qaSorted=true;if(window.__qaSorted&&saved.books.filter(b=>b.place==='floor').length===525)window.__qaScattered=true;}return JSON.stringify({qaSorted:!!window.__qaSorted,qaScattered:!!window.__qaScattered,ready:document.getElementById('loading')?.hidden===true,frames:window.__galleryRenderedFrames||0,qaTicks:window.__qaTicks||0,bootSaved:window.__galleryBootSaved,saved,storageError,errors:window.__galleryErrors||[],url:location.href,canvas:[document.getElementById('scene')?.width,document.getElementById('scene')?.height]});})()";
    [self.webView evaluateJavaScript:script completionHandler:^(id value, NSError *error) {
        NSString *directory = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
        if ([value isKindOfClass:NSString.class]) {
            NSMutableDictionary *snapshot=[[NSJSONSerialization JSONObjectWithData:[value dataUsingEncoding:NSUTF8StringEncoding] options:NSJSONReadingMutableContainers error:nil] mutableCopy];
            snapshot[@"nativeReady"]=@(self.galleryReady);snapshot[@"processTerminations"]=@(self.processTerminations);
            NSData *json=[NSJSONSerialization dataWithJSONObject:snapshot options:0 error:nil];[json writeToFile:[directory stringByAppendingPathComponent:@"gallery-smoke.json"] atomically:YES];
        }
        [self performSelector:@selector(pollSmoke) withObject:nil afterDelay:1];
    }];
}
#endif
- (BOOL)prefersStatusBarHidden { return YES; }
- (BOOL)prefersHomeIndicatorAutoHidden { return YES; }
- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)action decisionHandler:(void (^)(WKNavigationActionPolicy))handler {
    handler([action.request.URL.scheme isEqualToString:@"quietstacks"] && [action.request.URL.host isEqualToString:@"localhost"] ? WKNavigationActionPolicyAllow : WKNavigationActionPolicyCancel);
}
- (void)webViewWebContentProcessDidTerminate:(WKWebView *)webView {
    self.processTerminations++;[self failWithKind:@"web-process-terminated" details:@{@"message":@"iOS ended the web content process. WebKit did not provide the reason."}];
}
@end

@interface AppDelegate : UIResponder <UIApplicationDelegate>
@property(nonatomic, strong) UIWindow *window;
@end
@implementation AppDelegate
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)options {
    self.window = [[UIWindow alloc] initWithFrame:UIScreen.mainScreen.bounds];
    self.window.rootViewController = [GalleryController new];
    [self.window makeKeyAndVisible];
    return YES;
}
@end

int main(int argc, char *argv[]) {
    @autoreleasepool { return UIApplicationMain(argc, argv, nil, NSStringFromClass(AppDelegate.class)); }
}
