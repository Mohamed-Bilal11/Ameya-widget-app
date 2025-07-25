import WidgetKit
import SwiftUI

struct SimpleEntry: TimelineEntry {
    let date: Date
    let summary: String
    let type: String
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), summary: "Loading...", type: "food")
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        let (summary, type) = loadSummary()
        completion(SimpleEntry(date: Date(), summary: summary, type: type))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        let (summary, type) = loadSummary()
        let entry = SimpleEntry(date: Date(), summary: summary, type: type)
        completion(Timeline(entries: [entry], policy: .atEnd))
    }

  private func loadSummary() -> (String, String) {
      let defaults = UserDefaults(suiteName: "group.com.iderize.awesomeproject")
      let type = defaults?.string(forKey: "widget_type") ?? "food"

      switch type {
      case "movement":
          let movement = defaults?.string(forKey: "widget_text") ?? "Welcome! 👋"
          return (movement, "movement")

      case "activity":
          let activity = defaults?.string(forKey: "widget_text") ?? "Welcome! 👋"
          return (activity, "activity")

      default:
          let meal = defaults?.string(forKey: "widget_text") ?? "Welcome! 👋"
          return (meal, "meal")
      }
  }
}


struct MyWidgetEntryView: View {
    let entry: SimpleEntry

  var backgroundColor: Color {
          switch entry.type {
          case "movement":
              return Color(hex: "#E9F1E0")
          case "activity":
              return Color(hex: "#E9F0FC")
          default:
              return Color(hex: "#FFE6E8")
          }
      }

    var title: String {
        switch entry.type {
        case "movement": return "🍽️"
        case "activity": return "🏋️"
        default: return "🏃‍♂️"
        }
    }
  
  var linkURL: URL {
    switch entry.type {
    case "movement": URL(string: "awesomeproject://meal") ?? URL(string: "awesomeproject://")!
    case "activity": URL(string: "awesomeproject://movement") ?? URL(string: "awesomeproject://")!
    default: URL(string: "awesomeproject://activity") ?? URL(string: "awesomeproject://")!
    }
      }
  
  var iconName: String {
      switch entry.type {
      case "movement":
          return "Green" // Replace with your asset name
      case "activity":
          return "Blue"
      default:
          return "Pink"
      }
  }

  var body: some View {
    Link(destination: linkURL) {
      HStack(spacing: 4) {
                  Spacer()
                  Image(iconName) // From Assets.xcassets
                      .resizable()
                      .aspectRatio(contentMode: .fit)
                      .frame(width: 40, height: 40)
                      .background(Circle().fill(Color.black.opacity(0.3)))
              }
              .padding([.top], 2)
      VStack(alignment: .leading, spacing: 4) {
        Text(title)
            .font(.headline)
            .lineLimit(nil) // Allow multiline title
            .fixedSize(horizontal: false, vertical: true)
        Text(entry.summary)
            .font(.system(size: 16, weight: .medium))
            .foregroundColor(Color.black)
            .lineLimit(nil)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
      
      .background(backgroundColor) // ✅ Apply your color here
      .containerBackground(for: .widget) {
        backgroundColor
      }
    }
  }
}

struct MyWidget: Widget {
    let kind: String = "org.reactjs.native.example.AwesomeProject.MyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Meal & Movement Tracker")
        .description("Shows your most recent meal or movement.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

extension Color {
    init(hex: String) {
        var hexFormatted = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()

        if hexFormatted.hasPrefix("#") {
            hexFormatted.remove(at: hexFormatted.startIndex)
        }

        var rgbValue: UInt64 = 0
        Scanner(string: hexFormatted).scanHexInt64(&rgbValue)

        let red = Double((rgbValue & 0xFF0000) >> 16) / 255
        let green = Double((rgbValue & 0x00FF00) >> 8) / 255
        let blue = Double(rgbValue & 0x0000FF) / 255

        self.init(.sRGB, red: red, green: green, blue: blue)
    }
}
