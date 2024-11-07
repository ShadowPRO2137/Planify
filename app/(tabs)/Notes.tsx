import React, { useState, useContext, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Alert, StyleSheet, Modal, TextInput, Switch } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useUser } from '@/app/context/UserContext';

const DB_URL = 'https://66fc2a93c3a184a84d16505f.mockapi.io/Users';

interface Activity {
  name: string;
  startHour: string;
  endHour: string;
  notifications: number | null;
  day: string;
}

interface User {
  email: string;
  password: string;
  UserName: string;
  AboutMe: string;
  Joined: number;
  IsLightMode: boolean;
  id: number;
  plan?: string[];
}

const Calendar = () => {
  const { userId } = useUser();
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState<{ [key: string]: Activity[] }>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [activityName, setActivityName] = useState<string>('');
  const [startHour, setStartHour] = useState<string>('');
  const [endHour, setEndHour] = useState<string>('');
  const [enableNotifications, setEnableNotifications] = useState<boolean>(false);
  const [notificationTime, setNotificationTime] = useState<string>('');

  useEffect(() => {
    loadUserActivities();
  }, []);

  const loadUserActivities = async () => {
    try {
      const response = await fetch(`${DB_URL}/${userId}`);
      const user: User | null = response.ok ? await response.json() : null;
      if (user && user.plan) {
        const loadedActivities = user.plan.reduce((acc, entry) => {
          const [name, startHour, endHour, notifications, day] = entry.split('/');
          const activity: Activity = {
            name,
            startHour,
            endHour,
            notifications: notifications ? parseInt(notifications) : null,
            day,
          };
          acc[day] = [...(acc[day] || []), activity];
          return acc;
        }, {} as { [key: string]: Activity[] });
        setActivities(loadedActivities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      Alert.alert('Error', 'Could not load user activities, please try again later.');
    }
  };

  const updateUserActivityList = async (newActivity: Activity): Promise<void> => {
    try {
      const response = await fetch(`${DB_URL}/${userId}`);
      const user: User | null = response.ok ? await response.json() : null;
      if (user) {
        const activityEntry = `${newActivity.name}/${newActivity.startHour}/${newActivity.endHour}/${newActivity.notifications}/${newActivity.day}`;
        user.plan = [...(user.plan || []), activityEntry];
        await fetch(`${DB_URL}/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
      }
    } catch (error) {
      console.error('Error updating user activity list:', error);
      Alert.alert('Error', 'Could not update user activities, please try again later.');
    }
  };

  const handleSaveActivity = async () => {
    if (!validateActivityHour(startHour) || !validateActivityHour(endHour)) {
      Alert.alert('Invalid Time', 'Please enter a valid start and end time in HH:MM format.');
      return;
    }

    const dayName = currentDate.toLocaleString('default', { weekday: 'long' });
    const newActivity: Activity = {
      name: activityName,
      startHour,
      endHour,
      notifications: enableNotifications ? parseInt(notificationTime) : null,
      day: dayName,
    };

    setActivities((prevActivities) => ({
      ...prevActivities,
      [dayName]: [...(prevActivities[dayName] || []), newActivity],
    }));

    try {
      await updateUserActivityList(newActivity);
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'There was a problem saving your activity. Please try again later.');
    }
  };

  const getWeekRange = (date: Date) => {
    const dayOfWeek = date.getDay();
    const startDate = new Date(date);
    const endDate = new Date(date);
    startDate.setDate(date.getDate() - dayOfWeek + 1);
    endDate.setDate(startDate.getDate() + 5);
    return { startDate, endDate };
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    return `${day}${suffix} ${month} ${year}`;
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleAddActivity = () => {
    setModalVisible(true);
  };

  const resetForm = () => {
    setActivityName('');
    setStartHour('');
    setEndHour('');
    setEnableNotifications(false);
    setNotificationTime('');
  };

  const validateActivityHour = (hour: string) => {
    const re = /^(\d{1,2}):(\d{2})$/;
    const match = hour.match(re);
    if (!match) return false;
    const [_, hourStr, minuteStr] = match;
    const hourNum = parseInt(hourStr, 10);
    const minuteNum = parseInt(minuteStr, 10);
    return hourNum >= 0 && hourNum < 24 && minuteNum >= 0 && minuteNum < 60;
  };

  const handleTimeInput = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    let sanitizedValue = value.replace(/[^0-9:]/g, '');
    if (sanitizedValue.length === 2 && sanitizedValue[1] !== ':') {
      sanitizedValue = sanitizedValue.slice(0, 2) + ':' + sanitizedValue.slice(2);
    }
    if (sanitizedValue.length > 5) sanitizedValue = sanitizedValue.slice(0, 5);
    setter(sanitizedValue);
  };

  const { startDate, endDate } = getWeekRange(currentDate);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isLightMode ? 'white' : '#001f3f' }]}>
      <ScrollView horizontal>
        <ParallaxScrollView headerBackgroundColor={{ light: '#D0D0D0', dark: isLightMode ? '#D3D3D3' : '#353636' }} headerImage={<Ionicons size={250} name="calendar" style={styles.headerImage} />} additionalStyles={{ header: {}, content: { backgroundColor: isLightMode ? 'white' : '#1A1A1A' },}}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setIsLightMode(!isLightMode)} style={styles.lightDarkModeLoginButton}>
              <Ionicons name={isLightMode ? 'moon' : 'sunny'} size={30} color={isLightMode ? 'black' : 'white'} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
            <TouchableOpacity onPress={handlePrevWeek}>
              <Text style={[styles.arrow, { color: isLightMode ? 'black' : 'white' }]}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={[styles.weekRange, { color: isLightMode ? 'black' : 'white' }]}>
              {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
            <TouchableOpacity onPress={handleNextWeek}>
              <Text style={[styles.arrow, { color: isLightMode ? 'black' : 'white' }]}>{'>'}</Text>
            </TouchableOpacity>
          </View>
          {Object.keys(activities).map((day) => (
            <View key={day} style={styles.dayContainer}>
              <Text style={[styles.dayTitle, { color: isLightMode ? 'black' : 'white' }]}>{day}</Text>
              {activities[day].map((activity, index) => (
                <View key={index} style={styles.activityContainer}>
                  <Text style={[styles.activityText, { color: isLightMode ? 'black' : 'white' }]}>{activity.name}</Text>
                  <Text style={[styles.activityText, { color: isLightMode ? 'black' : 'white' }]}>
                    {activity.startHour} - {activity.endHour}
                  </Text>
                </View>
              ))}
              <TouchableOpacity onPress={handleAddActivity}>
                <Ionicons style={{ color: isLightMode ? '#50C878' : '#32CD32' }} size={30} name="add-circle" />
              </TouchableOpacity>
            </View>
          ))}
          <Modal visible={isModalVisible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.newActivityText}>Add New Activity</Text>
                <TextInput value={activityName} onChangeText={setActivityName} placeholder="Activity Name" style={styles.input} />
                <TextInput value={startHour} onChangeText={(value) => handleTimeInput(value, setStartHour)} placeholder="Start Hour (HH:MM)" style={styles.input} />
                <TextInput value={endHour} onChangeText={(value) => handleTimeInput(value, setEndHour)} placeholder="End Hour (HH:MM)" style={styles.input} />
                <View style={styles.notificationContainer}>
                  <Text>Enable Notifications</Text>
                  <Switch value={enableNotifications} onValueChange={setEnableNotifications} />
                </View>
                {enableNotifications && (
                  <TextInput value={notificationTime} onChangeText={setNotificationTime} placeholder="Notification Time (Minutes before)" keyboardType="numeric" style={styles.input}/>
                )}
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={handleSaveActivity} style={styles.saveButton}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ParallaxScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    color: '#808080',
    bottom: -50,
    left: -25,
    position: 'absolute',
  },
  lightDarkModeLoginButton: {
    marginLeft: 'auto',
    padding: 10,
  },
  weekRange: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  dayContainer: {
    margin: 10,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  activityContainer: {
    padding: 10,
  },
  activityText: {
    fontSize: 16,
  },
  newActivityText: {
    fontSize: 32,
  },
  arrow: {
    fontSize: 30,
    marginHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#50C878',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#ff5c5c',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Calendar;
