//
//  MainWindow.swift
//  Ghostery
//
//  Look and behaviour of the main window.
//

import AppKit
import SwiftUI

/// Native frosted background, which blurs what is behind the window.
struct MainWindowBackground: NSViewRepresentable {
  func makeNSView(context: Context) -> NSVisualEffectView {
    let view = NSVisualEffectView()
    // In light mode this material lets about 20% of the blurred backdrop
    // through, the same as the design's 80% white frosted glass
    view.material = .headerView
    view.blendingMode = .behindWindow
    // Stay frosted also when the window is inactive
    view.state = .active
    return view
  }

  func updateNSView(_ nsView: NSVisualEffectView, context: Context) {}
}

/// Gives the hosting window a tall, transparent title bar, so the content can
/// draw its own header under the traffic lights.
struct MainWindowConfigurator: NSViewRepresentable {
  /// Size of the window on the first launch
  var size: CGSize

  /// Height of the configured title bar, which SwiftUI adds to the window size.
  /// Measured on a template window, so it's known before the first layout.
  static let titleBarHeight: CGFloat = {
    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 100, height: 100),
      styleMask: [.titled, .closable, .miniaturizable, .resizable],
      backing: .buffered,
      defer: true
    )
    configure(window)
    return window.frame.height - window.contentLayoutRect.height
  }()

  private static func configure(_ window: NSWindow) {
    window.titleVisibility = .hidden
    window.titlebarAppearsTransparent = true
    window.titlebarSeparatorStyle = .none
    window.styleMask.insert(.fullSizeContentView)
    window.isMovableByWindowBackground = true
    // An empty unified toolbar makes the title bar as tall as the design's
    // header and vertically centers the traffic lights within it.
    if window.toolbar == nil {
      window.toolbar = NSToolbar(identifier: "MainToolbar")
    }
    window.toolbarStyle = .unified
  }

  func makeNSView(context: Context) -> NSView {
    WindowObservingView(size: size)
  }

  func updateNSView(_ nsView: NSView, context: Context) {}

  private final class WindowObservingView: NSView {
    let size: CGSize
    private weak var configuredWindow: NSWindow?

    init(size: CGSize) {
      self.size = size
      super.init(frame: .zero)
    }

    required init?(coder: NSCoder) {
      fatalError("init(coder:) has not been implemented")
    }

    override func viewDidMoveToWindow() {
      super.viewDidMoveToWindow()
      guard let window, window !== configuredWindow else { return }
      configuredWindow = window
      MainWindowConfigurator.configure(window)

      // SwiftUI fits the window to its content only after placing it on the
      // screen, so apply the default size now to get it centered on the first
      // launch (later launches restore the last frame). The content view
      // covers the whole window, so its size is the window size.
      window.setContentSize(size)
      MainWindowController.shared.attach(window)
    }
  }
}

/// Shows and hides the main window. While the app has its icon in the menu
/// bar, closing the window hides it, and the app keeps running without
/// a Dock icon until the window is shown again.
@MainActor
final class MainWindowController: NSObject {
  static let shared = MainWindowController()

  /// Whether the window starts hidden, like when the app is launched at login
  private var startsHidden = false

  private weak var window: NSWindow?
  private var delegateProxy: WindowDelegateProxy?

  /// Whether any part of the window is on the screen, not hidden or covered
  var isWindowVisible: Bool {
    window?.occlusionState.contains(.visible) ?? false
  }

  func attach(_ window: NSWindow) {
    self.window = window
    // SwiftUI's delegate handles everything else of the window
    let proxy = WindowDelegateProxy(original: window.delegate) { [weak self] in
      guard AppSettings.shared.showsMenuBarIcon else { return true }
      self?.hide()
      return false
    }
    delegateProxy = proxy
    window.delegate = proxy

    if startsHidden {
      startsHidden = false
      hide()
    }
  }

  /// Hides the window as soon as it's created, or now if it already is
  func hideAtStart() {
    if window != nil {
      hide()
    } else {
      startsHidden = true
    }
  }

  /// Shows the window in front, also when it's hidden, minimized,
  /// or the app is hidden. Called only on the user's request, like a click
  /// on the menu bar icon.
  func show() {
    guard let window else {
      openWindow()
      return
    }
    NSApp.setActivationPolicy(.regular)
    NSApp.unhide(nil)
    if window.isMiniaturized {
      window.deminiaturize(nil)
    }
    // Deferred until the click on the menu bar icon is handled, as macOS
    // undoes the activation during it. NSApp.activate() is refused there,
    // leaving the window behind the windows of the active app.
    DispatchQueue.main.async {
      NSApp.activate(ignoringOtherApps: true)
      window.makeKeyAndOrderFront(nil)
    }
  }

  // SwiftUI doesn't open the window when a link launches the app, and
  // doesn't restore it after quitting with the window closed. Checked on
  // the next turn of the run loop, after SwiftUI restores its windows.
  private func openWindow() {
    DispatchQueue.main.async {
      if self.window == nil {
        // Opens a new window of the window group, like the Dock icon does
        _ = NSApp.delegate?.applicationOpenUntitledFile?(NSApp)
      }
      DispatchQueue.main.async {
        if self.window != nil {
          self.show()
        }
      }
    }
  }

  private func hide() {
    window?.orderOut(nil)
    NSApp.setActivationPolicy(.accessory)
  }
}

/// Asks before the window closes, and passes everything else to the
/// original delegate of the window
private final class WindowDelegateProxy: NSObject, NSWindowDelegate {
  private weak var original: NSWindowDelegate?
  private let shouldClose: () -> Bool

  init(original: NSWindowDelegate?, shouldClose: @escaping () -> Bool) {
    self.original = original
    self.shouldClose = shouldClose
  }

  func windowShouldClose(_ sender: NSWindow) -> Bool {
    guard shouldClose() else { return false }
    return original?.windowShouldClose?(sender) ?? true
  }

  override func responds(to selector: Selector!) -> Bool {
    super.responds(to: selector) || (original?.responds(to: selector) ?? false)
  }

  override func forwardingTarget(for selector: Selector!) -> Any? {
    original?.responds(to: selector) == true ? original : super.forwardingTarget(for: selector)
  }
}
