import Foundation

// ---------------------------------------------------------------------------
// What the widget shows at a given moment (docs/widgets-spec.md).
//
// The app only hands over her streak row (src/lib/widget.ios.ts). Everything
// else is worked out here from the clock, so the widget keeps moving through
// the day, and into a frozen run, without the app being opened. The streak
// rules mirror `streakStatus()` in src/lib/streak.ts.
// ---------------------------------------------------------------------------

let appGroup = "group.app.posta.ios"

/** Her streak row as the app last saw it. */
struct StreakRow: Codable {
  var count: Int
  /** YYYY-MM-DD on her phone's calendar, or nil before her first round. */
  var last: String?
  /** A run lost to a missed day, still recoverable today. */
  var banked: Int

  static func load() -> StreakRow? {
    guard
      let raw = UserDefaults(suiteName: appGroup)?.string(forKey: "streak"),
      let data = raw.data(using: .utf8)
    else { return nil }
    return try? JSONDecoder().decode(StreakRow.self, from: data)
  }
}

struct Word: Codable {
  var id: String
  var es: String
  var en: String
  var ex: String

  static let fallback = Word(id: "quilombo", es: "quilombo", en: "mess, chaos", ex: "¡Qué quilombo el tránsito!")

  /** The bundled list (npm run widget:words), in the order every phone walks through. */
  static let all: [Word] = {
    let url =
      Bundle.main.url(forResource: "words", withExtension: "json")
      ?? Bundle.main.url(forResource: "words", withExtension: "json", subdirectory: "assets")
    guard let url, let data = try? Data(contentsOf: url),
      let words = try? JSONDecoder().decode([Word].self, from: data), !words.isEmpty
    else { return [fallback] }
    return words
  }()

  /** One word per calendar day, the same for everyone. */
  static func of(_ date: Date, calendar: Calendar = .current) -> Word {
    let origin = calendar.date(from: DateComponents(year: 2026, month: 1, day: 1))!
    let days = calendar.dateComponents([.day], from: origin, to: calendar.startOfDay(for: date)).day ?? 0
    return all[((days % all.count) + all.count) % all.count]
  }
}

enum Moment {
  /** Until 14:00: the word of the day. */
  case word
  case sideEye, sad, begging, crying, lastHour
  /** Today's round is done. */
  case practiced
  /** A day was missed; the run can still be bought back. */
  case frozen
  /** One round done on the comeback day; one more saves the run. */
  case recovering
  /** No run and none to mourn, after 14:00. */
  case fresh
}

struct Day {
  var moment: Moment
  /** The number on the chip. */
  var count: Int
  /** The run shown struck through, when frozen or recovering. */
  var lost: Int?

  /** The hours the widget changes at. Midnight is the new day. */
  static let turns = [0, 14, 17, 20, 22, 23]

  static func at(_ date: Date, row: StreakRow?, calendar: Calendar = .current) -> Day {
    let hour = calendar.component(.hour, from: date)
    let today = dayString(date, calendar)
    let yesterday = dayString(calendar.date(byAdding: .day, value: -1, to: date)!, calendar)

    guard let row, let last = row.last else {
      return Day(moment: hour < 14 ? .word : .fresh, count: 0)
    }
    if last == today {
      return row.banked > 0
        ? Day(moment: .recovering, count: row.count, lost: row.banked)
        : Day(moment: .practiced, count: row.count)
    }
    if last != yesterday {
      return row.count > 0
        ? Day(moment: .frozen, count: 0, lost: row.count)
        : Day(moment: hour < 14 ? .word : .fresh, count: 0)
    }
    let moment: Moment =
      switch hour {
      case ..<14: .word
      case ..<17: .sideEye
      case ..<20: .sad
      case ..<22: .begging
      case ..<23: .crying
      default: .lastHour
      }
    return Day(moment: moment, count: row.count)
  }

  static func dayString(_ date: Date, _ calendar: Calendar) -> String {
    let c = calendar.dateComponents([.year, .month, .day], from: date)
    return String(format: "%04d-%02d-%02d", c.year!, c.month!, c.day!)
  }
}
