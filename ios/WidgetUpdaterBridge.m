//
//  WidgetUpdaterBridge.m
//  AwesomeProject
//
//  Created by Dhivya Subramanian on 03/07/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetUpdater, NSObject)

RCT_EXTERN_METHOD(updateWidget:(NSString * _Nullable)summary withType:(NSString * _Nullable)widgetType)

@end

