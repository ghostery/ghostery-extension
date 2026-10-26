//
//  SectionStrings.swift
//  Ghostery
//
//  Texts of the sections which both apps show, each in its own views. The
//  texts of the views shared by the apps are in their own files.
//

import Foundation

enum SectionStrings {
  // You can translate your strings here
  enum Home {
    static let title = String(localized: "Protect your privacy.\nBlock trackers.", comment: "Title of the Home section, in two lines")
    static let description = String(localized: "Ghostery helps you take control of your data across the web.")
    static let installHeader = String(localized: "Install Ghostery in your browser")
    static let safariDescription = String(localized: "Follow these simple steps to enable Ghostery in Safari.")
    static let safariEnabledDescription = String(localized: "Ghostery works correctly in Safari.")
    static let edgeDescription = String(localized: "Install Ghostery extension from the Edge Add-ons.")
    static let enabled = String(localized: "Enabled", comment: "State of Ghostery in a browser")
    static let moreOptions = String(localized: "More options")
    static let disableInSafari = String(localized: "Disable Ghostery in Safari")
    static let viewInstructions = String(localized: "View instructions", comment: "Button showing the steps to enable or disable Ghostery in Safari")
  }

  /// Page of the Home section with the steps to enable the extension
  enum SafariInstructions {
    static let title = String(localized: "Enable Ghostery Privacy\nAd Block for Safari", comment: "Title in two lines. Ghostery Privacy Ad Block is the name of the extension.")
    static let stepsHeader = String(localized: "How to enable Ghostery")
  }

  enum LearningZone {
    #if os(macOS)
    static let title = String(localized: "Privacy,\nexplained simply.", comment: "Title of the Learning Zone section, in two lines")
    #else
    static let title = String(localized: "Privacy, explained simply.", comment: "Title of the Learning Zone section, in one line")
    #endif
    static let description = String(localized: "Privacy shouldn’t be complicated. Explore our guides, follow the latest privacy news, and discover how to make the web work better for you.")
  }

  enum Contribute {
    static let title = String(localized: "Become a contributor", comment: "Title of the Contribute section")
    static let description = String(localized: "Help Ghostery fight for a web where privacy is a basic human right.")
    static let subtitle = String(localized: "As a Contributor, you’ll support the development of the entire Ghostery Privacy Suite", comment: "Ghostery Privacy Suite is the name of all Ghostery’s products")
  }
}
