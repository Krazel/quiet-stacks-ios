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

@interface GalleryController : UIViewController <WKNavigationDelegate>
@property(nonatomic, strong) WKWebView *webView;
@end

@implementation GalleryController
- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor colorWithRed:23/255.0 green:18/255.0 blue:14/255.0 alpha:1];
    WKWebViewConfiguration *configuration = [WKWebViewConfiguration new];
    [configuration setURLSchemeHandler:[GalleryAssets new] forURLScheme:@"quietstacks"];
#if TARGET_OS_SIMULATOR
    if ([NSProcessInfo.processInfo.arguments containsObject:@"--gallery-smoke"]) {
        NSString *diagnostics = @"window.__galleryErrors=[];const originalError=console.error;console.error=(...a)=>{window.__galleryErrors.push(a.map(String).join(' '));originalError.apply(console,a);};window.addEventListener('error',e=>window.__galleryErrors.push(e.message));";
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
    [self.webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"quietstacks://localhost/index.html"]]];
}
#if TARGET_OS_SIMULATOR
- (void)pollSmoke {
    NSString *script = @"JSON.stringify({ready:document.getElementById('loading')?.hidden===true,title:document.querySelector('#loading h2')?.textContent,errors:window.__galleryErrors||[],url:location.href,canvas:[document.getElementById('scene')?.width,document.getElementById('scene')?.height]})";
    [self.webView evaluateJavaScript:script completionHandler:^(id value, NSError *error) {
        NSString *directory = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
        if ([value isKindOfClass:NSString.class]) [value writeToFile:[directory stringByAppendingPathComponent:@"gallery-smoke.json"] atomically:YES encoding:NSUTF8StringEncoding error:nil];
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
    [webView reload];
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
