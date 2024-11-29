/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  NativeModules,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import HotSpot from '@react-native-tethering/hotspot';
import { NetworkInfo } from "react-native-network-info";



function App(): React.JSX.Element {

  const [connectedDeviceList, setConnectedDeviceList] = useState<Array<string>>([])
  const [loading, setLoading] = useState(false)
  const [deviceIpAddress, setDeviceIpAddress] = useState("")


  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };



  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
        ]);

        if (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
          (granted[PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES] === PermissionsAndroid.RESULTS.GRANTED || Platform.Version < 33)
        ) {
          Alert.alert("Permissions granted");
        } else {
          Alert.alert("Permissions denied");
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const checkHotSpotActive = async () => {
    try {
      let isHotspotEnabled = await HotSpot.isHotspotEnabled()

      if (isHotspotEnabled) {
        return true
      }
      Alert.alert("Pls enable hotspot", "")
      return false
    } catch (error) {
      console.log("error", JSON.stringify(error))
      return false
    }
  }


  const getListOfConnectedDevice = async () => {
    try {
      setLoading(true)
      let hotspotStatus = await checkHotSpotActive()
      if (hotspotStatus) {
        const connectedDevices = await NativeModules.HotspotModule.scanHotspotDevices();
        setConnectedDeviceList(connectedDevices)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log("error", JSON.stringify(error))
    }

  }

  const getDeviceIp = async () => {
    try {
      let deviceIP = await NetworkInfo.getIPV4Address()
      setDeviceIpAddress(deviceIP as string)
    } catch (error) {
      console.log("error", JSON.stringify(error))
    }
  }

  useEffect(() => {
    requestPermissions()
    getDeviceIp()
  }, [])

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.containerView}>
        <Text>Device IPv4 : {deviceIpAddress}</Text>
        {loading ?
          <View>
            <Text>loading... it will take some time pls wait</Text>
            <ActivityIndicator size={"large"} color={"green"} />
          </View>
          :
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => getListOfConnectedDevice()}
            >
              <Text>Check Connected devices</Text>
            </TouchableOpacity>
            <FlatList
              data={connectedDeviceList}
              keyExtractor={(item) => item}
              renderItem={(deviceIp) =>
                <View style={ styles.innerView}>
                  <Text>{deviceIp.item}</Text>
                </View>

              }
            />
          </>
        }

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  innerView: { 
      width: "100%", 
      padding: 5, 
      backgroundColor: "#f0f0f0", 
      borderBottomWidth: 1 },
  containerView: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },

  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  button: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#a2c4fc"
  }

});

export default App;
