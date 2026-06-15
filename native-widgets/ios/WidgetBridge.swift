// Pont natif iOS pour pousser les stats vers le widget WidgetKit.
//
// A copier dans ios/WidgetBridge/WidgetBridge.swift apres prebuild.
// Le widget AlpesInBikeWidget lit ensuite depuis App Group "group.com.alpesinbike.app".
//
// Necessite :
//   1. App Group "group.com.alpesinbike.app" active dans Xcode pour l app principale
//      et pour la target widget (Signing & Capabilities)
//   2. ce fichier + WidgetBridge.m dans le projet iOS
//
// Cote JS, on appelle NativeModules.WidgetBridge.setData(snapshot) puis reloadAll.

import Foundation
import React
import WidgetKit

@objc(WidgetBridge)
class WidgetBridge: NSObject {
    static let appGroupId = "group.com.alpesinbike.app"

    @objc(setData:resolver:rejecter:)
    func setData(_ data: NSDictionary,
                 resolver resolve: @escaping RCTPromiseResolveBlock,
                 rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let defaults = UserDefaults(suiteName: WidgetBridge.appGroupId) else {
            reject("no_group", "App Group introuvable. Verifiez la capability dans Xcode.", nil)
            return
        }
        for (k, v) in data {
            if let key = k as? String {
                defaults.set(v, forKey: key)
            }
        }
        defaults.synchronize()
        resolve(["ok": true])
    }

    @objc(reloadAll:rejecter:)
    func reloadAll(_ resolve: @escaping RCTPromiseResolveBlock,
                   rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        resolve(["ok": true])
    }

    @objc static func requiresMainQueueSetup() -> Bool { false }
}
