import CoreText
import SwiftUI
import WidgetKit

// ---------------------------------------------------------------------------
// The home screen widget: the word of the day until 14:00, then Pancho getting
// more upset by the hour until today's round is done. Small and medium.
//
// Every measurement below is from the mockups, drawn 340 units tall; `u` is
// one of those units on this phone, so one layout serves every widget size.
// ---------------------------------------------------------------------------

struct PostaEntry: TimelineEntry {
  let date: Date
  let day: Day
  let word: Word
}

struct PostaProvider: TimelineProvider {
  func placeholder(in context: Context) -> PostaEntry {
    PostaEntry(date: .now, day: Day(moment: .word, count: 0), word: .fallback)
  }

  func getSnapshot(in context: Context, completion: @escaping (PostaEntry) -> Void) {
    completion(context.isPreview ? placeholder(in: context) : entry(at: .now, row: StreakRow.load()))
  }

  /** Now, then every turn of the next two days: enough that a phone left alone still freezes on time. */
  func getTimeline(in context: Context, completion: @escaping (Timeline<PostaEntry>) -> Void) {
    let calendar = Calendar.current
    let row = StreakRow.load()
    let now = Date.now
    var dates = [now]
    for offset in 0...2 {
      let base = calendar.startOfDay(for: calendar.date(byAdding: .day, value: offset, to: now)!)
      for hour in Day.turns {
        if let turn = calendar.date(bySettingHour: hour, minute: 0, second: 0, of: base), turn > now {
          dates.append(turn)
        }
      }
    }
    completion(Timeline(entries: dates.map { entry(at: $0, row: row) }, policy: .atEnd))
  }

  private func entry(at date: Date, row: StreakRow?) -> PostaEntry {
    PostaEntry(date: date, day: Day.at(date, row: row), word: Word.of(date))
  }
}

struct PostaWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "PostaWidget", provider: PostaProvider()) { entry in
      PostaWidgetView(entry: entry)
    }
    .configurationDisplayName("Posta")
    .description("Your streak and the Argentine word of the day.")
    .supportedFamilies([.systemSmall, .systemMedium])
    .contentMarginsDisabled()
  }
}

// MARK: - Look

private extension Color {
  init(hex: UInt32) {
    self.init(
      red: Double((hex >> 16) & 0xFF) / 255, green: Double((hex >> 8) & 0xFF) / 255, blue: Double(hex & 0xFF) / 255)
  }

  // src/lib/theme.ts
  static let ink = Color(hex: 0x3A2A20)
  static let inkSoft = Color(hex: 0x4E4038)
  static let surface = Color(hex: 0xFFF9F3)
  static let butter = Color(hex: 0xFFE08A)
  static let flame = Color(hex: 0xFF8A5B)
  static let flameOff = Color(hex: 0xD9CBBB)
  static let frostFace = Color(hex: 0xDFEFFA)
  static let frostInk = Color(hex: 0x3E7FAE)
  static let sky = Color(hex: 0xA9D6F5)
}

private enum Typeface {
  /** A widget extension has no Info.plist fonts of its own to lean on: register the bundled files once. */
  static let ready: Void = {
    let urls =
      (Bundle.main.urls(forResourcesWithExtension: "ttf", subdirectory: nil) ?? [])
      + (Bundle.main.urls(forResourcesWithExtension: "ttf", subdirectory: "assets") ?? [])
    for url in urls { CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil) }
  }()

  static func display(_ size: CGFloat) -> Font {
    _ = ready
    return .custom("Gabarito-Black", fixedSize: size)
  }

  static func body(_ size: CGFloat, heavy: Bool = false) -> Font {
    _ = ready
    return .custom(heavy ? "Figtree-ExtraBold" : "Figtree-Bold", fixedSize: size)
  }
}

/** Where Pancho stands: his height, and how far in from the right and bottom edges. */
private struct Stand {
  var height: CGFloat
  var right: CGFloat
  var bottom: CGFloat
}

private struct Look {
  var scene: String
  var pose: String
  var small: Stand
  var medium: Stand
  /** The nudge, short for the small widget and fuller for the medium one. */
  var line: (small: String, medium: String) = ("", "")
  /** A night scene: light type. */
  var dark = false

  static func of(_ day: Day) -> Look {
    switch day.moment {
    case .word:
      Look(
        scene: "scene-morning", pose: "pancho-waving",
        small: Stand(height: 178, right: 6, bottom: -22), medium: Stand(height: 318, right: 82, bottom: -34))
    case .sideEye:
      Look(
        scene: "scene-afternoon", pose: "pancho-sideeye",
        small: Stand(height: 204, right: 10, bottom: -6), medium: Stand(height: 312, right: 44, bottom: -8),
        line: ("¿Y? ¿Hoy nada?", "¿Y? ¿Hoy no practicás?"))
    case .sad:
      Look(
        scene: "scene-sunset", pose: "pancho-sad",
        small: Stand(height: 204, right: 22, bottom: -8), medium: Stand(height: 308, right: 66, bottom: -6),
        line: ("Te espero, eh.", "Se me enfrió el mate."))
    case .begging:
      Look(
        scene: "scene-dusk", pose: "pancho-begging",
        small: Stand(height: 204, right: 36, bottom: -8), medium: Stand(height: 312, right: 92, bottom: -6),
        line: ("Dale, porfa.", "Dale, porfa. Son 2 minutos."))
    case .crying:
      Look(
        scene: "scene-fire", pose: "pancho-crying",
        small: Stand(height: 206, right: 16, bottom: -8), medium: Stand(height: 312, right: 50, bottom: -6),
        line: ("¡Me matás!", "¡Me estás matando!"))
    case .lastHour:
      Look(
        scene: "scene-night", pose: "pancho-collapsed",
        small: Stand(height: 196, right: 30, bottom: 4), medium: Stand(height: 280, right: 56, bottom: 22),
        line: ("Chau, racha.", "Chau, racha de \(day.count) día\(day.count == 1 ? "" : "s")."), dark: true)
    case .practiced:
      Look(
        scene: "scene-goal", pose: "pancho-goal",
        small: Stand(height: 232, right: 60, bottom: -40), medium: Stand(height: 372, right: 44, bottom: -70),
        line: ("¡Golazo!", "¡Golazo! Hasta mañana."))
    case .frozen:
      Look(
        scene: "scene-ice", pose: "pancho-sad",
        small: Stand(height: 150, right: 50, bottom: 24), medium: Stand(height: 262, right: 96, bottom: 30),
        line: ("¡Me congelé!", "Tu racha se congeló."), dark: true)
    case .recovering:
      Look(
        scene: "scene-thaw", pose: "pancho-begging",
        small: Stand(height: 204, right: 36, bottom: -8), medium: Stand(height: 312, right: 92, bottom: -6),
        line: ("¡Una más!", "Una más y la salvás."))
    case .fresh:
      Look(
        scene: "scene-morning", pose: "pancho-waving",
        small: Stand(height: 216, right: 30, bottom: -22), medium: Stand(height: 318, right: 82, bottom: -34),
        line: ("¿Arrancamos?", "¿Arrancamos? Son 2 minutos."))
    }
  }
}

// MARK: - Pieces

/** The streak's flame, the path from src/components/flame.tsx (a 100 × 120 box). */
private struct FlameShape: Shape {
  func path(in rect: CGRect) -> Path {
    var p = Path()
    p.move(to: CGPoint(x: 50, y: 4))
    p.addCurve(to: CGPoint(x: 84, y: 66), control1: CGPoint(x: 58, y: 22), control2: CGPoint(x: 80, y: 36))
    p.addCurve(to: CGPoint(x: 50, y: 116), control1: CGPoint(x: 88, y: 96), control2: CGPoint(x: 70, y: 116))
    p.addCurve(to: CGPoint(x: 14, y: 74), control1: CGPoint(x: 30, y: 116), control2: CGPoint(x: 12, y: 100))
    p.addCurve(to: CGPoint(x: 32, y: 34), control1: CGPoint(x: 16, y: 56), control2: CGPoint(x: 28, y: 48))
    p.addCurve(to: CGPoint(x: 44, y: 54), control1: CGPoint(x: 36, y: 46), control2: CGPoint(x: 40, y: 52))
    p.addCurve(to: CGPoint(x: 50, y: 4), control1: CGPoint(x: 42, y: 36), control2: CGPoint(x: 44, y: 20))
    p.closeSubpath()
    return p.applying(CGAffineTransform(scaleX: rect.width / 100, y: rect.height / 120))
  }
}

/** The header's streak sticker: a pill with an ink outline and a hard shadow, slapped on a little crooked. */
private struct Chip: View {
  let day: Day
  let u: CGFloat

  private var icy: Bool { day.lost != nil }
  private var lit: Bool { day.moment == .practiced }
  private var outline: Color { day.moment == .frozen ? Color(hex: 0x121A22) : day.moment == .lastHour ? Color(hex: 0x1F1611) : .ink }
  private var face: Color { day.moment == .frozen ? .frostFace : lit ? .butter : .surface }

  var body: some View {
    HStack(spacing: 6 * u) {
      if icy {
        Image(systemName: "snowflake")
          .font(.system(size: 24 * u, weight: .heavy))
          .foregroundStyle(Color.frostInk)
      } else {
        FlameShape()
          .fill(lit ? Color.flame : Color.flameOff)
          .overlay(FlameShape().stroke(Color.ink, style: StrokeStyle(lineWidth: 2.6 * u, lineJoin: .round)))
          .frame(width: 26 * u, height: 31 * u)
      }
      if let lost = day.lost {
        Text("\(lost)").strikethrough().foregroundStyle(day.moment == .frozen ? Color.ink : Color(hex: 0x7A6556))
      }
      if !icy || day.moment == .recovering {
        Text("\(day.count)")
      }
    }
    .font(Typeface.display(28 * u))
    .foregroundStyle(Color.ink)
    .padding(.leading, 12 * u)
    .padding(.trailing, 18 * u)
    .frame(height: 50 * u)
    .background {
      ZStack {
        Capsule().fill(outline).padding(-4 * u).offset(x: 4 * u, y: 6 * u)
        Capsule().fill(outline).padding(-4 * u)
        Capsule().fill(face)
      }
    }
    .rotationEffect(.degrees(-3))
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(icy ? "Streak frozen" : "\(day.count) day streak")
  }
}

/** The block of ice a frozen Pancho sits in. */
private struct Ice: View {
  let size: CGSize
  let u: CGFloat

  var body: some View {
    RoundedRectangle(cornerRadius: size.width * 0.18)
      .fill(Color.sky.opacity(0.55))
      .overlay(RoundedRectangle(cornerRadius: size.width * 0.18).stroke(Color(hex: 0x121A22), lineWidth: 4 * u))
      .overlay(alignment: .topLeading) {
        ZStack(alignment: .topLeading) {
          Capsule().fill(.white.opacity(0.8))
            .frame(width: size.width * 0.07, height: size.height * 0.24)
            .rotationEffect(.degrees(28))
            .offset(x: size.width * 0.12, y: size.height * 0.08)
          Capsule().fill(.white.opacity(0.8))
            .frame(width: size.width * 0.05, height: size.height * 0.13)
            .rotationEffect(.degrees(28))
            .offset(x: size.width * 0.24, y: size.height * 0.07)
        }
      }
      .frame(width: size.width, height: size.height)
  }
}

// MARK: - The widget

struct PostaWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: PostaEntry

  var body: some View {
    PostaFace(entry: entry, wide: family == .systemMedium)
      .widgetURL(link)
      .containerBackground(for: .widget) { PostaScene(entry: entry, wide: family == .systemMedium) }
  }

  /** The word opens its card; everything else opens the app where today's round is one tap away. */
  private var link: URL {
    entry.day.moment == .word
      ? URL(string: "posta://word-of-day?id=\(entry.word.id.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")")!
      : URL(string: "posta://home")!
  }
}

/** The scene behind everything, held to the bottom right corner where Pancho stands. */
struct PostaScene: View {
  let entry: PostaEntry
  let wide: Bool

  var body: some View {
    GeometryReader { geo in
      Image(Look.of(entry.day).scene + (wide ? "" : "-small"))
        .resizable()
        .aspectRatio(contentMode: .fill)
        .frame(width: geo.size.width, height: geo.size.height, alignment: .bottomTrailing)
        .clipped()
    }
  }
}

/** The chip, the words and Pancho. */
struct PostaFace: View {
  let entry: PostaEntry
  let wide: Bool

  private var look: Look { Look.of(entry.day) }
  private var showsWord: Bool { entry.day.moment == .word }

  var body: some View {
    GeometryReader { geo in
      let u = geo.size.height / 340
      let stand = wide ? look.medium : look.small
      ZStack(alignment: .topLeading) {
        Color.clear.overlay(alignment: .bottomTrailing) {
          ZStack(alignment: .bottomTrailing) {
            Image(look.pose)
              .resizable()
              .scaledToFit()
              .frame(height: stand.height * u)
              .offset(x: -stand.right * u, y: -stand.bottom * u)
            if entry.day.moment == .frozen {
              let block = wide ? CGSize(width: 256 * u, height: 292 * u) : CGSize(width: 156 * u, height: 170 * u)
              Ice(size: block, u: u).offset(x: -(wide ? 60 : 24) * u, y: -16 * u)
            }
          }
          .accessibilityHidden(true)
        }

        VStack(alignment: .leading, spacing: 0) {
          Chip(day: entry.day, u: u)
          if showsWord {
            wordBlock(u)
          } else {
            Text(wide ? look.line.medium : look.line.small)
              .font(Typeface.display((wide ? 50 : 38) * u))
              .tracking(-(wide ? 1 : 0.5) * u)
              .lineLimit(wide ? 2 : 1)
              .minimumScaleFactor(0.6)
              .foregroundStyle(look.dark ? Color.frostFace : Color.ink)
              .frame(width: (wide ? 380 : 290) * u, alignment: .leading)
              .padding(.top, (wide ? 40 : 22) * u)
          }
        }
        .padding(.leading, (wide ? 30 : 26) * u)
        .padding(.top, 26 * u)
      }
    }
  }

  @ViewBuilder
  private func wordBlock(_ u: CGFloat) -> some View {
    Text("WORD OF THE DAY")
      .font(Typeface.body((wide ? 19 : 17) * u, heavy: true))
      .tracking(1.5 * u)
      .foregroundStyle(Color.inkSoft)
      .padding(.top, 14 * u)
    Text(entry.word.es.prefix(1).uppercased() + entry.word.es.dropFirst())
      .font(Typeface.display((wide ? 68 : 54) * u))
      .tracking(-(wide ? 1.5 : 1) * u)
      .lineLimit(1)
      .minimumScaleFactor(0.5)
      .foregroundStyle(Color.ink)
      .frame(width: (wide ? 400 : 290) * u, alignment: .leading)
    Text(entry.word.en)
      .font(Typeface.body((wide ? 28 : 26) * u))
      .lineLimit(wide ? 1 : 2)
      .minimumScaleFactor(0.7)
      .foregroundStyle(Color(hex: 0x6B5647))
      .frame(width: (wide ? 400 : 180) * u, alignment: .leading)
      .padding(.top, 4 * u)
    if wide {
      Text("“\(entry.word.ex)”")
        .font(Typeface.body(25 * u))
        .lineLimit(2)
        .minimumScaleFactor(0.7)
        .foregroundStyle(Color.ink)
        .frame(width: 400 * u, alignment: .leading)
        .padding(.top, 24 * u)
    }
  }
}
