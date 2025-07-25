//
//  MyWidgetBundle.swift
//  MyWidget
//
//  Created by Dhivya Subramanian on 03/07/25.
//

import WidgetKit
import SwiftUI

@main
struct MyWidgetBundle: WidgetBundle {
    var body: some Widget {
        MyWidget()
        MyWidgetControl()
        MyWidgetLiveActivity()
    }
}
