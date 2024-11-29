/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Alert,
  NativeModules,
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
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



function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const getPermissions = async () => {
    try {
      let writeSettingGranted = await HotSpot.isWriteSettingsGranted()
      if (writeSettingGranted) {
        return
      }
      await HotSpot.openWriteSettings()
      

    } catch (error) {
      console.log("error", JSON.stringify(error))
    }

  }


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
      Alert.alert("Pls enable hotspot","")
      return false
    } catch (error) {
      console.log("error", JSON.stringify(error))
      return false
    }
  }


  const getListOfConnectedDevice = async()=>{
    try {
      let hotspotStatus = await checkHotSpotActive()
      if(hotspotStatus){
        const connectedDevicesList = await NativeModules.HotspotModule.scanHotspotDevices();
        console.log(connectedDevicesList)
        Alert.alert("connectedDevicesList",JSON.stringify(connectedDevicesList))
      }
    } catch (error) {
      console.log("error",JSON.stringify(error))
    }
  
  }


  useEffect(() => {
    getPermissions()
    requestPermissions()
  }, [])

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <TouchableOpacity
      style={{}}
      onPress={()=>getListOfConnectedDevice()}
      >
        <Text>Check Connected devices</Text>
        </TouchableOpacity>   

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },

});

export default App;
