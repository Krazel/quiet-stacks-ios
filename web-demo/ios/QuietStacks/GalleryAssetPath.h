#import <Foundation/Foundation.h>

// Standardization may remove /private. Resolve both sides identically before
// checking containment; a raw bundle path cannot be compared to a canonical file.
static NSURL *QSCanonicalAssetURL(NSURL *url) {
    return url.URLByResolvingSymlinksInPath.URLByStandardizingPath;
}

static NSURL *QSResolveAssetURL(NSURL *root, NSURL *request, NSError **error) {
    NSString *reason=nil;
    NSString *relative=[NSURLComponents componentsWithURL:request resolvingAgainstBaseURL:NO].percentEncodedPath.stringByRemovingPercentEncoding;
    if([relative hasPrefix:@"/"])relative=[relative substringFromIndex:1];
    if(relative.length==0)relative=@"index.html";
    if(!root.isFileURL||![request.scheme isEqual:@"quietstacks"]||![request.host isEqual:@"localhost"])reason=@"Invalid bundled resource origin";
    for(NSString *component in relative.pathComponents){
        if([@[@"/",@".",@".."] containsObject:component])reason=@"Invalid bundled resource path component";
    }
    NSURL *canonicalRoot=QSCanonicalAssetURL(root);
    NSURL *file=QSCanonicalAssetURL([canonicalRoot URLByAppendingPathComponent:relative]);
    NSArray *baseParts=canonicalRoot.path.pathComponents,*fileParts=file.path.pathComponents;
    if(fileParts.count<=baseParts.count||![[fileParts subarrayWithRange:NSMakeRange(0,baseParts.count)] isEqualToArray:baseParts])reason=@"Bundled resource is outside the game folder";
    if(reason){
        if(error)*error=[NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorNoPermissionsToReadFile userInfo:@{NSLocalizedDescriptionKey:reason}];
        return nil;
    }
    return file;
}
