### We cannot implement Hotspot scanner for scanning device ip's on hotspot as per android doc on Android 10+ we cannot access /proc/net/arp  file which store hotspot info
check below doc
https://developer.android.com/about/versions/10/privacy/changes#proc-net-filesystem


tried another below solution
- created a native module HotspotModule.kt to run ping sweep and fetch device ip's. even though this solution only check ip's on wifi network only there no way we can get hotspot ip's as there is restricted access to /proc/net/arp  it requirs device to be rooted or app should be system app.

### setup
- to run project run below commands in root of project
```
npm install
npm run android
```

### app demo
- apk link - https://drive.google.com/file/d/1WoRQAwgdxEkRPxoxrK44IrmeIuJf7DEM/view?usp=sharing
- install apk shared on drive and allow all the permission


### Code flow
- All RN code is present in App.tsx
- on app launch we get required permission by calling requestPermissions function
- device ip is also fetched in getDeviceIp function using packager eact-native-network-info
- when button is pressed we call getListOfConnectedDevice function where first we check if hotspot is active using lib @react-native-tethering/hotspot.
- after hotspot is activated we call Native module HotspotModule.kt where network scanning is code is present for running ping sweep and return device ip's on network to react native side. ping sweeping is performed on background thread and require longer as it is scannig all subnet's and getting active device ip's
- used Wifi manager in HotspotModule.kt to get dhcp info to extract subnet.
- HotspotModule.kt file is present in same directory as MainApplication.kt


Note- as we cannot access Hotspot info on Android 10 or higher app will only show other devices ip once connected to wifi
