package com.hotspotscanner

import android.content.Context
import android.net.wifi.WifiManager
import com.facebook.react.bridge.*
import java.net.InetAddress

class HotspotModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "HotspotModule"
    }

    @ReactMethod
    fun scanHotspotDevices(promise: Promise) {
        try {
            // Access the WifiManager for DHCP info
            val wifiManager = reactApplicationContext.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            val dhcpInfo = wifiManager.dhcpInfo

            // Extract the subnet from the IP address (assuming 255.255.255.0 netmask)
            val ipAddress = dhcpInfo.serverAddress
            val subnet = "${ipAddress and 0xFF}." +
                    "${(ipAddress shr 8) and 0xFF}." +
                    "${(ipAddress shr 16) and 0xFF}."

            val connectedDevices = Arguments.createArray()

            // Run ping sweep in a background thread to avoid blocking the UI
            Thread {
                try {
                    // Perform a ping sweep in the subnet (192.168.x.x format)
                    for (i in 2..254) { // 192.168.x.2 to 192.168.x.254
                        val host = "$subnet$i"
                        val reachable = InetAddress.getByName(host).isReachable(100) // Timeout 100ms
                        if (reachable) {
                            connectedDevices.pushString(host)
                        }
                    }
                    promise.resolve(connectedDevices)
                } catch (e: Exception) {
                    promise.reject("ERROR", "Error during ping sweep: ${e.message}")
                }
            }.start()

        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to initiate scan: ${e.message}")
        }
    }
}
