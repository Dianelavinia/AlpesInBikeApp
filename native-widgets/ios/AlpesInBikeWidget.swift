// Widget WidgetKit pour iOS, à intégrer via expo-apple-targets.
//
// Mise en route :
//   1. yarn add expo-apple-targets
//   2. Dans app.json, plugin expo-apple-targets avec target "Widget"
//   3. Copier ce fichier dans ios/AlpesInBikeWidget/AlpesInBikeWidget.swift
//   4. Activer l'App Group "group.com.alpesinbike.app" dans Xcode pour
//      partager les données entre l'app et le widget
//   5. Dans l'app Expo, écrire les stats dans UserDefaults(suiteName:)
//      à chaque fin de ride et chaque ouverture
//
// Documentation : https://docs.expo.dev/guides/apple-targets/

import WidgetKit
import SwiftUI

// MARK: - Modèle de données partagé
struct AlpesData {
    let km: Int
    let co2: Int
    let rank: Int
    let rankTotal: Int
    let streakDays: Int
    let monthlyKm: Int
    let monthlyGoal: Int
    let badges: Int

    static func load() -> AlpesData {
        let defaults = UserDefaults(suiteName: "group.com.alpesinbike.app")
        return AlpesData(
            km: defaults?.integer(forKey: "km") ?? 248,
            co2: defaults?.integer(forKey: "co2") ?? 312,
            rank: defaults?.integer(forKey: "rank") ?? 4,
            rankTotal: defaults?.integer(forKey: "rankTotal") ?? 26,
            streakDays: defaults?.integer(forKey: "streak") ?? 12,
            monthlyKm: defaults?.integer(forKey: "monthlyKm") ?? 248,
            monthlyGoal: defaults?.integer(forKey: "monthlyGoal") ?? 400,
            badges: defaults?.integer(forKey: "badges") ?? 8
        )
    }
}

// MARK: - Timeline Provider
struct AlpesEntry: TimelineEntry {
    let date: Date
    let data: AlpesData
}

struct AlpesProvider: TimelineProvider {
    func placeholder(in context: Context) -> AlpesEntry {
        AlpesEntry(date: Date(), data: AlpesData.load())
    }
    func getSnapshot(in context: Context, completion: @escaping (AlpesEntry) -> Void) {
        completion(AlpesEntry(date: Date(), data: AlpesData.load()))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<AlpesEntry>) -> Void) {
        let entry = AlpesEntry(date: Date(), data: AlpesData.load())
        // Refresh toutes les heures, l'app refresh aussi à chaque fin de ride.
        let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// MARK: - Couleurs marque
extension Color {
    static let aibOrange = Color(red: 225/255, green: 90/255, blue: 35/255)
    static let aibForest = Color(red: 13/255, green: 79/255, blue: 61/255)
    static let aibForestDark = Color(red: 6/255, green: 48/255, blue: 30/255)
    static let aibCream = Color(red: 250/255, green: 247/255, blue: 242/255)
}

// MARK: - Small
struct SmallWidgetView: View {
    let data: AlpesData
    var body: some View {
        ZStack {
            LinearGradient(colors: [.aibForest, .aibForestDark], startPoint: .top, endPoint: .bottom)
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 5) {
                    Image(systemName: "bicycle").font(.system(size: 11)).foregroundColor(.aibOrange)
                    Text("ALPES IN BIKE").font(.system(size: 9, weight: .bold)).tracking(1.5).foregroundColor(.white.opacity(0.7))
                }
                Spacer()
                Text("\(data.km)").font(.system(size: 44, weight: .bold)).foregroundColor(.white)
                Text("km cette semaine").font(.system(size: 11)).foregroundColor(.white.opacity(0.8))
                Divider().background(Color.white.opacity(0.2))
                HStack(spacing: 4) {
                    Image(systemName: "trophy.fill").font(.system(size: 10)).foregroundColor(.aibOrange)
                    Text("#\(data.rank) sur \(data.rankTotal)").font(.system(size: 11, weight: .bold)).foregroundColor(.white)
                }
            }.padding(14)
        }
    }
}

// MARK: - Medium
struct MediumWidgetView: View {
    let data: AlpesData
    var pct: Double { min(1.0, Double(data.monthlyKm) / Double(max(1, data.monthlyGoal))) }
    var body: some View {
        ZStack {
            Color.aibCream
            VStack(spacing: 10) {
                HStack(spacing: 12) {
                    ZStack { Circle().fill(Color.aibForest.opacity(0.12))
                        Image(systemName: "leaf.fill").foregroundColor(.aibForest)
                    }.frame(width: 44, height: 44)
                    VStack(alignment: .leading) {
                        Text("BILAN CARBONE").font(.system(size: 10, weight: .bold)).tracking(1.5).foregroundColor(.gray)
                        Text("\(data.co2) kg CO2").font(.system(size: 26, weight: .bold))
                        Text("économisés cette année").font(.system(size: 11)).foregroundColor(.gray)
                    }
                    Spacer()
                }
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3).fill(Color.gray.opacity(0.15)).frame(height: 6)
                        RoundedRectangle(cornerRadius: 3).fill(Color.aibOrange).frame(width: geo.size.width * pct, height: 6)
                    }
                }.frame(height: 6)
                HStack {
                    Text("Objectif annuel").font(.system(size: 11)).foregroundColor(.gray)
                    Spacer()
                    Text("\(Int(pct * 100))%").font(.system(size: 11, weight: .bold)).foregroundColor(.aibOrange)
                }
            }.padding(14)
        }
    }
}

// MARK: - Widget bundle
struct AlpesInBikeWidget: Widget {
    let kind = "AlpesInBikeWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AlpesProvider()) { entry in
            switch entry.data {
            default:
                Group {
                    if WidgetFamily.systemSmall == .systemSmall { SmallWidgetView(data: entry.data) }
                }
            }
        }
        .configurationDisplayName("Alpes in Bike")
        .description("Vos kilomètres, classement et bilan carbone.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular])
    }
}

@main
struct AlpesInBikeWidgetBundle: WidgetBundle {
    var body: some Widget {
        AlpesInBikeWidget()
    }
}
