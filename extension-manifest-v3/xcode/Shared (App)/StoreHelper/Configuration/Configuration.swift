//
//  Configuration.swift
//  Configuration
//
//  Created by Russell Archer on 16/06/2021.
//

import Foundation
import OrderedCollections

/// Provides static methods for reading plist configuration files.
public struct Configuration {

    private init() {}

    /// Read the contents of the product definition property list.
    /// - Returns: Returns a set of ProductId if the list was read, nil otherwise.
    public static func readConfigFile() -> OrderedSet<ProductId>? {

        guard let result = Configuration.readPropertyFile(filename: StoreConstants.ConfigFile) else {
            StoreLog.event(.configurationNotFound)
            StoreLog.event(.configurationFailure)
            return nil
        }

        guard result.count > 0 else {
            StoreLog.event(.configurationEmpty)
            StoreLog.event(.configurationFailure)
            return nil
        }

        guard let values = result[StoreConstants.ConfigFile] as? [String] else {
            StoreLog.event(.configurationEmpty)
            StoreLog.event(.configurationFailure)
            return nil
        }

        StoreLog.event(.configurationSuccess)

        return OrderedSet<ProductId>(values.compactMap { $0 })
    }

    /// Read a plist property file and return a dictionary of values
    private static func readPropertyFile(filename: String) -> [String : AnyObject]? {

        if let path = Bundle.main.path(forResource: filename, ofType: "plist") {
            if let contents = NSDictionary(contentsOfFile: path) as? [String : AnyObject] {
                return contents
            }
        }

        return nil  // [:]
    }
}

