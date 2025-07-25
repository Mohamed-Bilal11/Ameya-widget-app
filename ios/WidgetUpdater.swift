//
//  WidgetUpdater.swift
//  AwesomeProject
//
//  Created by Dhivya Subramanian on 03/07/25.
//

import Foundation
import WidgetKit

@objc(WidgetUpdater)
class WidgetUpdater: NSObject {
  
  @objc(updateWidget:withType:)
  func updateWidget(_ summary: String?, withType widgetType: String?) {
    let safeSummary = summary ?? "No summary"
    let kind = widgetType ?? "default"

    let defaults = UserDefaults(suiteName: "group.com.iderize.awesomeproject")
    
    // ✅ Store common keys regardless of type
    defaults?.set(safeSummary, forKey: "widget_text")
    defaults?.set(kind, forKey: "widget_type")
    
    // Optional: legacy support (not required if you're reading from widget_text/widget_type now)
    if kind == "food" {
      defaults?.set(safeSummary, forKey: "mealSummary")
    } else if kind == "movement" {
      defaults?.set(safeSummary, forKey: "movementSummary")
    } else if kind == "activity" {
      defaults?.set(safeSummary, forKey: "activitySummary")
    }

    WidgetCenter.shared.reloadTimelines(ofKind: "org.reactjs.native.example.AwesomeProject.MyWidget")
    print("✅ Widget updated with: \(safeSummary) [\(kind)]")
  }
}
