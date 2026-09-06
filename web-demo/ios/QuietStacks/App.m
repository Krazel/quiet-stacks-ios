#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>

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
    NSString *failureBridge=@"window.addEventListener('error',()=>window.webkit.messageHandlers.galleryStatus.postMessage('error'));window.addEventListener('unhandledrejection',()=>window.webkit.messageHandlers.galleryStatus.postMessage('error'));";
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
    UIStackView *stack=[[UIStackView alloc] initWithArrangedSubviews:@[self.loadingLabel,self.retryButton]];stack.axis=UILayoutConstraintAxisVertical;stack.spacing=22;stack.translatesAutoresizingMaskIntoConstraints=NO;
    [self.view addSubview:self.loadingPanel];[self.loadingPanel addSubview:stack];
    [NSLayoutConstraint activateConstraints:@[[self.loadingPanel.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],[self.loadingPanel.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],[self.loadingPanel.topAnchor constraintEqualToAnchor:self.view.topAnchor],[self.loadingPanel.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor],[stack.centerXAnchor constraintEqualToAnchor:self.loadingPanel.centerXAnchor],[stack.centerYAnchor constraintEqualToAnchor:self.loadingPanel.centerYAnchor],[stack.widthAnchor constraintLessThanOrEqualToAnchor:self.loadingPanel.widthAnchor multiplier:0.8]]];
    [self loadGallery];
}
- (void)loadGallery {
    self.galleryReady=NO;self.loadingPanel.hidden=NO;self.loadingLabel.text=@"Opening the gallery…";self.retryButton.hidden=YES;
    NSInteger generation=++self.launchGeneration;
    [self.webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"quietstacks://localhost/index.html"]]];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW,45*NSEC_PER_SEC),dispatch_get_main_queue(),^{if(generation==self.launchGeneration&&!self.galleryReady)[self showLoadFailure];});
}
- (void)showLoadFailure {
    self.galleryReady=NO;self.loadingPanel.hidden=NO;self.loadingLabel.text=@"The gallery could not stay open. Please try again.";self.retryButton.hidden=NO;
}
- (void)userContentController:(WKUserContentController *)controller didReceiveScriptMessage:(WKScriptMessage *)message {
    if(!message.frameInfo.isMainFrame)return;
    if([message.body isEqual:@"ready"]){self.galleryReady=YES;self.loadingPanel.hidden=YES;}
    else if([message.body isEqual:@"error"])[self showLoadFailure];
}
- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {[self showLoadFailure];}
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {if(error.code!=NSURLErrorCancelled)[self showLoadFailure];}
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
    self.processTerminations++;[self showLoadFailure];
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
