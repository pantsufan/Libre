import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import {
  AppInstalledChecker,
  CheckPackageInstallation,
} from 'react-native-check-app-install';
import RNPickerSelect from 'react-native-picker-select';

const App = () => {
  const [sha, setSha] = useState('');
  const [value, setValue] = useState('');
  const [check, setCheck] = useState(false);
  const [version, setVersion] = useState('');

  const pastedURL =
    'https://github.com/LibreTubeAlpha/Archive/raw/main/app-arm64-v8a-debug-signed.apk';

  const requestStorage = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'LibreTube Alpha Storage Permission',
          message:
            'Download needs storage permission ' +
            'so that it download and save the app.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Download Started');
        downloadFile();
      } else {
        console.log('Downlooad Denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const android = RNFetchBlob.android;

  console.log('version is ', version);

  const downloadFile = () => {
    const {config, fs} = RNFetchBlob;
    const date = new Date();
    const fileDir = fs.dirs.DownloadDir;
    config({
      // add this option that makes response data to be stored as a file,
      // this is much more performant.
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        title: 'LibreTubeAlpha.apk',
        description: 'Debug build of LibreTube',
        mime: 'application/vnd.android.package-archive',
        mediaScannable: true,
        notification: true,
        path:
          fileDir +
          '/LibreTubeAlpha/LibreTube_' +
          date.getDay() +
          date.getFullYear() +
          date.getMilliseconds() +
          '.apk',
        description: 'Downloading The Debug Build',
      },
    })
      .fetch('GET', version)
      .then(res => {
        // the temp file path
        storeData(sha);
        console.log('The file saved to ', res.path());
        android.actionViewIntent(
          res.path(),
          'application/vnd.android.package-archive',
        );
      });
  };

  useEffect(() => {
    fetch('https://api.github.com/repos/libre-tube/NightlyBuilds/commits')
      .then(response => response.json())
      .then(json => {
        setSha(json[0].sha);
      });
  }, []);

  // fetch('https://api.github.com/repos/libre-tube/NightlyBuilds/commits')
  //   .then(response => response.json())
  //   .then(json => {
  //     setSha(json[0].sha);
  //   });

  const storeData = async value => {
    try {
      await AsyncStorage.setItem('@sha', value);
    } catch (e) {
      // saving error
    }
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@sha');
      if (value !== null) {
        setValue(value);
      }
    } catch (e) {
      // error reading value
    }
  };
  getData();

  // checks if libretube debug build is installed or not
  AppInstalledChecker.isAppInstalledAndroid('com.github.libretube.debug').then(
    isInstalled => {
      console.log('Libre debug found ', isInstalled);
      setCheck(isInstalled);
      // isInstalled is true if the app is installed or false if not
    },
  );

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>LibreTube Alpha Downloader</Text>
        {/* {sha == value && check ? (
          <Text style={{padding: 10, color: '#F5F8FA'}}>
            No New Update Available
          </Text>
        ) : (
          <Text style={{padding: 10, color: '#F5F8FA'}}>Update Available</Text>
        )} */}

        <RNPickerSelect
          placeholder={{label: 'Select Architecture', value: null}}
          onValueChange={version => setVersion(version)}
          items={[
            {
              label: 'arm64-v8a',
              value:
                'https://github.com/libre-tube/NightlyBuilds/raw/main/app-arm64-v8a-debug-signed.apk',
            },
            {
              label: 'armeabi-v7a',
              value:
                'https://github.com/libre-tube/NightlyBuilds/raw/main/app-armeabi-v7a-debug-signed.apk',
            },
            {
              label: 'universal',
              value:
                'https://github.com/libre-tube/NightlyBuilds/raw/main/app-universal-debug-signed.apk',
            },
            {
              label: 'x86',
              value:
                'https://github.com/libre-tube/NightlyBuilds/raw/main/app-x86-debug-signed.apk',
            },
            {
              label: 'x86_64',
              value:
                'https://github.com/libre-tube/NightlyBuilds/raw/main/app-x86_64-debug-signed.apk',
            },
          ]}
          style={pickerSelectStyles}
        />
        {/* <Text>Fetched Value {sha}</Text>
        <Text>Stored Value {value}</Text> */}

        {check == true ? (
          <>
            {value == sha ? (
              <TouchableOpacity style={styles.button2} disabled={true}>
                <Text style={styles.text2}>No Update Found</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  requestStorage();
                }}>
                <Text style={styles.text2}>Download Update</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              requestStorage();
            }}>
            <Text style={styles.text2}>Download Now</Text>
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          backgroundColor: '#657786',
        }}>
        <Text style={styles.footerText}>made with ❤️ by Joel</Text>
      </View>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#14171A',
  },
  button: {
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    alignSelf: 'center',
    backgroundColor: '#1DA1F2',
    paddingLeft: 20,
    borderRadius: 20,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  button2: {
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    alignSelf: 'center',
    backgroundColor: '#657786',
    paddingLeft: 20,
    borderRadius: 20,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#1DA1F2',
    fontSize: 50,
    textAlign: 'center',
    padding: 20,
    fontWeight: 'bold',
  },
  text2: {
    color: '#F5F8FA',
    fontSize: 18,
    textAlign: 'center',
    padding: 5,
  },

  footerText: {
    fontWeight: 'bold',
    fontSize: 14,
    alignSelf: 'center',
    padding: 18,
    color: '#F5F8FA',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 18,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: '#F5F8FA',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
