#import <Foundation/Foundation.h>
#import "../ios/QuietStacks/GalleryAssetPath.h"

static NSUInteger checks=0;
static void Check(BOOL ok,NSString *message){checks++;if(!ok){fprintf(stderr,"FAIL: %s\n",message.UTF8String);exit(1);}}
int main(void){@autoreleasepool{
    NSFileManager *fm=NSFileManager.defaultManager;
    NSString *base=[@"/tmp" stringByAppendingPathComponent:[@"quiet-stacks-path-" stringByAppendingString:NSUUID.UUID.UUIDString]];
    NSString *web=[base stringByAppendingPathComponent:@"web"];
    Check([fm createDirectoryAtPath:[web stringByAppendingPathComponent:@"assets"] withIntermediateDirectories:YES attributes:nil error:nil],@"Create isolated fixture");
    NSData *content=[@"local game" dataUsingEncoding:NSUTF8StringEncoding];
    Check([content writeToFile:[web stringByAppendingPathComponent:@"index.html"] atomically:YES],@"Write fixture");
    Check([content writeToFile:[web stringByAppendingPathComponent:@"assets/book cover.png"] atomically:YES],@"Write nested fixture");
    NSURL *root=[NSURL fileURLWithPath:web isDirectory:YES];
    NSURL *privateRoot=[NSURL fileURLWithPath:[@"/private" stringByAppendingString:web] isDirectory:YES];
    NSURL *request=[NSURL URLWithString:@"quietstacks://localhost/index.html"];
    NSURL *legacyFile=[[privateRoot URLByAppendingPathComponent:@"index.html"] URLByStandardizingPath];
    Check(![legacyFile.path hasPrefix:[privateRoot.path stringByAppendingString:@"/"]],@"Reproduce legacy /private mismatch");
    for(NSURL *r in @[root,privateRoot,[root URLByAppendingPathComponent:@"."]]){
        NSError *error=nil;NSURL *file=QSResolveAssetURL(r,request,&error);
        Check(file!=nil&&error==nil,@"Canonical and aliased roots accept index");
        Check([[NSData dataWithContentsOfURL:file] isEqualToData:content],@"Resolved index is readable");
        file=QSResolveAssetURL(r,[NSURL URLWithString:@"quietstacks://localhost/assets/book%20cover.png?v=164"],&error);
        Check([[NSData dataWithContentsOfURL:file] isEqualToData:content],@"Decode path once and ignore query");
    }
    Check(QSResolveAssetURL(root,[NSURL URLWithString:@"quietstacks://localhost/"],nil)!=nil,@"Empty path maps to index");
    for(NSString *url in @[@"quietstacks://elsewhere/index.html",@"https://localhost/index.html",@"quietstacks://localhost/%2e%2e/outside.js",@"quietstacks://localhost/assets/%2e%2e/%2e%2e/outside.js",@"quietstacks://localhost/%2fetc/passwd"]){
        NSError *error=nil;Check(QSResolveAssetURL(root,[NSURL URLWithString:url],&error)==nil&&error.code==NSURLErrorNoPermissionsToReadFile,@"Reject origin/traversal escape");
    }
    NSString *outside=[base stringByAppendingPathComponent:@"outside.js"];
    Check([content writeToFile:outside atomically:YES],@"Write outside fixture");
    Check([fm createSymbolicLinkAtPath:[web stringByAppendingPathComponent:@"escape.js"] withDestinationPath:outside error:nil],@"Create escaping symlink fixture");
    Check(QSResolveAssetURL(root,[NSURL URLWithString:@"quietstacks://localhost/escape.js"],nil)==nil,@"Reject symlink escape");
    Check([fm createSymbolicLinkAtPath:[web stringByAppendingPathComponent:@"inside.js"] withDestinationPath:[web stringByAppendingPathComponent:@"index.html"] error:nil],@"Create internal symlink fixture");
    Check(QSResolveAssetURL(root,[NSURL URLWithString:@"quietstacks://localhost/inside.js"],nil)!=nil,@"Accept symlink confined to game folder");
    Check([fm removeItemAtPath:base error:nil],@"Remove only isolated test fixture");
    printf("{\"passed\":true,\"checks\":%lu,\"legacyPrivatePathFailureReproduced\":true,\"canonicalAssetsReadable\":true,\"escapesRejected\":true}\n",(unsigned long)checks);
    return 0;
}}
