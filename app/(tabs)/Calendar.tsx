import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Switch, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useUser } from '@/app/context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/.expo/types/navigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';

type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Calendar'>;

const DB_URL = 'https://66fc2a93c3a184a84d16505f.mockapi.io/Users';
const daysOfWeek = ["Mo","Tu","We","Th","Fr","Sa","Su"];

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

const Calendar: React.FC = () => {
  const { userId } = useUser();
  const [activityName, setActivityName] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 1));
  const [daysArray, setDaysArray] = useState<number[][]>([]);
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const [activitiesText, setActivitiesText] = useState('');
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [startHour, setStartHour] = useState<string>('');
  const [endHour, setEndHour] = useState<string>('');
  const [enableNotifications, setEnableNotifications] = useState<boolean>(false);
  const [notificationTime, setNotificationTime] = useState<string>('');
  const [formattedActivityDate, setFormattedActivityDate] = useState(new Date(2024, 10, 1));
  const [formattedStringDate, setFormattedStringDate] = useState<string>('');
  const navigation = useNavigation<CalendarScreenNavigationProp>();

  useEffect(() => {
    generateCalendar(currentDate);
  }, [currentDate]);

  const goToAccountScreen = () => {
    navigation.navigate('Account');
  };

  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const days: number[][] = [];
    const adjustedFirstDay = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;

    let row: number[] = [];

    if (adjustedFirstDay > 1) {
      const daysInPreviousMonth = new Date(year, month, 0).getDate();
      const prevMonthStart = daysInPreviousMonth - adjustedFirstDay + 2;

      for (let i = prevMonthStart; i <= daysInPreviousMonth; i++) {
        row.push(-i);
      }
    }

    for (let i = 1; i <= daysInCurrentMonth; i++) {
      row.push(i);
      if (row.length === 7) {
        days.push(row);
        row = [];
      }
    }

    if (row.length > 0 && row.length < 7) {
      const lastDay = new Date(year, month, daysInCurrentMonth).getDay();
      const isEndingOnSunday = lastDay === 0;

      if (!isEndingOnSunday) {
        let nextMonthDay = 1;
        while (row.length < 7) {
          row.push(-nextMonthDay++);
        }
      }
      days.push(row);
    }  

    setDaysArray(days);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const ShowHideActivities = async (date: string) => {
    try {
      const response = await fetch(`https://66fc2a93c3a184a84d16505f.mockapi.io/Users/${userId}`);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const userData = await response.json();
  
      if (!userData || !Array.isArray(userData.plan)) {
        return "No activities found.";
      }
  
      const activitiesForDate = userData.plan.filter((activity: string) => {
        const [, , , , activityDate] = activity.split("/");
        return activityDate === date; 
      });
  
      const formattedActivities = activitiesForDate.map(formatActivity).join(", ");
      return formattedActivities.length
        ? `Activities for ${date}: ${formattedActivities}`
        : "You don't have activities for this day.";
    } catch (error) {
      console.error("Error fetching activities:", error);
      return "An error occurred while retrieving activities.";
    }
  };
  
  const formatActivity = (activity: string): string => {
    const [name, startTime, endTime, notification, date] = activity.split("/");
    const formattedString = `${name} ${startTime} - ${endTime}`;

    if (notification && notification !== "null") {
        return `${formattedString} App will notificate ${notification} minutes before ${startTime}`;
    }

    return formattedString;
  };

  const handleAddActivity = () => {
    setCurrentDate(formattedActivityDate);
    setModalVisible(true);
  };

  const formatDateAndShowActivitiesReset = async (newDate: string) => {
    const text = await ShowHideActivities(newDate);
    setActivitiesText(text);
  };
 
  const formatDateAndShowActivities = async (day: number, month: number, year: number) => {
    setFormattedStringDate(`${month}-${day}-${year}`)
    const formattedDate = `${month}-${day}-${year}`
    setFormattedActivityDate(new Date(year, month-1, day))
    const text = await ShowHideActivities(formattedDate);
    setActivitiesText(text);
  };

  const handleTimeInput = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    let sanitizedValue = value.replace(/[^0-9:]/g, '');

    if (sanitizedValue.length === 2 && sanitizedValue[1] !== ':') {
    sanitizedValue = sanitizedValue.slice(0, 2) + ':' + sanitizedValue.slice(2);
    }

    if (sanitizedValue.length > 5) sanitizedValue = sanitizedValue.slice(0, 5);

    setter(sanitizedValue);
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
  const handleSaveActivity = async () => {
    if (!validateActivityHour(startHour) || !validateActivityHour(endHour)) {
      Alert.alert('Invalid Time', 'Please enter a valid start and end time in HH:MM format.');
      return;
    }

    const formattedDate = `${currentDate.getMonth() + 1}-${currentDate.getDate()}-${currentDate.getFullYear()}`;
  
    const newActivity: Activity = {
      name: activityName,
      startHour,
      endHour,
      notifications: enableNotifications ? parseInt(notificationTime) : null,
      day: formattedDate,
    };
    try {
      await updateUserActivityList(newActivity);
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'There was a problem saving your activity. Please try again later.');
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
  const resetForm = () => {
    setActivityName('');
    setStartHour('');
    setEndHour('');
    setEnableNotifications(false);
    setNotificationTime('');
    formatDateAndShowActivitiesReset(formattedStringDate)
  };

  return (
    <SafeAreaView style={styles.container}>
      <ParallaxScrollView headerBackgroundColor={{ light: '#D0D0D0', dark: isLightMode ? '#D3D3D3' : '#353636' }} headerImage={<Ionicons size={250} name="calendar" style={styles.headerImage} />} additionalStyles={{ header: {}, content: { backgroundColor: isLightMode ? 'white' : '#1A1A1A' },}}>
        {userId !== -1 ? (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                {activitiesText && (
                  <Text style={[styles.activityInfo, { color: isLightMode ? 'black' : 'white' }]}>
                    {activitiesText}
                  </Text>
                )}
                {activitiesText !== "" && (
                  <TouchableOpacity onPress={handleAddActivity}>
                    <Ionicons style={[styles.activityInfo, { color: isLightMode ? '#50C878' : '#32CD32' }]} size={30}  name="add-circle" />
                  </TouchableOpacity>
                )}
              </View>
              {activitiesText !== "No activities found." ? (
                <TouchableOpacity onPress={() => setIsLightMode(!isLightMode)}>
                  <Ionicons name={isLightMode ? 'moon' : 'sunny'} size={30} color={isLightMode ? 'black' : 'white'} style={styles.ColorModeSwitch1}/>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setIsLightMode(!isLightMode)}>
                  <Ionicons name={isLightMode ? 'moon' : 'sunny'} size={30} color={isLightMode ? 'black' : 'white'} style={styles.ColorModeSwitch2}/>
                </TouchableOpacity>
              )}
              {activitiesText == "" && (
                <TouchableOpacity onPress={() => setIsLightMode(!isLightMode)}>
                  <Ionicons name={isLightMode ? 'moon' : 'sunny'} size={30} color={isLightMode ? 'black' : 'white'} style={styles.ColorModeSwitch2}/>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.header}>
              <TouchableOpacity onPress={goToPreviousMonth}>
                <Ionicons name="chevron-back-outline" size={24} style={[{ color: isLightMode ? 'black' : 'white' }]} />
              </TouchableOpacity>
              <Text style={[styles.headerText, { color: isLightMode ? 'black' : 'white' }]}>
                {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={goToNextMonth}>
                <Ionicons name="chevron-forward-outline" size={24} style={[{ color: isLightMode ? 'black' : 'white' }]}/>
              </TouchableOpacity>
            </View>
            <View style={styles.daysOfWeek}>
              {daysOfWeek.map((day, index) => (
                <Text key={index} style={[styles.dayOfWeek, { color: isLightMode ? 'black' : 'white' }]}>{day}</Text>
              ))}
            </View>
            <ScrollView contentContainerStyle={styles.calendar}>
              {daysArray.map((week, rowIndex) => (
                <View key={`week-${rowIndex}`} style={styles.weekRow}>
                  {week.map((day, dayIndex) => {
                    const isCurrentMonth = day > 0;
                    const dayStyle = [
                      styles.dayCircle,
                      isCurrentMonth ? (isToday(day) ? styles.currentDay : styles.currentMonthDay) : styles.adjacentMonthDay,
                    ];
                    return (
                      <TouchableOpacity key={`day-${rowIndex}-${dayIndex}`} onPress={() => formatDateAndShowActivities(Math.abs(day), Number(currentDate.toLocaleString('default', { month: 'numeric' })), currentDate.getFullYear())}>
                        <View style={dayStyle}>
                          <Text style={isCurrentMonth ? styles.dayText : styles.adjacentDayText}>
                            {Math.abs(day)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
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
            </ScrollView>
          </View>
        ) : (
          <View>
            <TouchableOpacity onPress={() => setIsLightMode(!isLightMode)}>
              <Ionicons name={isLightMode ? 'moon' : 'sunny'} size={30} color={isLightMode ? 'black' : 'white'} />
            </TouchableOpacity>
            <Text style={[{ color: isLightMode ? 'black' : 'white' }]}>You are not loggined in! Login in</Text>
            <TouchableOpacity onPress={goToAccountScreen}>
              <Text style={[{ color: isLightMode ? 'blue' : 'blue' }]}>here!</Text>
            </TouchableOpacity>
            <Text style={styles.bigFont}> </Text> 
          </View>
        )}
      </ParallaxScrollView>
    </SafeAreaView>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  activityInfo: {
    left: 50,
    bottom: 6,
  },
  ColorModeSwitch1: {
    right: 250,
    bottom: 10,
  },
  ColorModeSwitch2: {
    right: 125,
    bottom: 7,
  },
  bigFont: {
    fontSize: 300,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newActivityText: {
    fontSize: 32,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  container: { 
    flex: 1, 
    backgroundColor: 'white' 
  },
  headerImage: {
    color: '#808080',
    bottom: -50,
    left: -25,
    position: 'absolute',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  dayOfWeek: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  calendar: { 
    padding: 16 
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    columnGap: 25,    
    marginVertical: 4,              
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  currentMonthDay: { 
    backgroundColor: '#F0F0F0' 
  },
  adjacentMonthDay: { 
    backgroundColor: '#E0E0E0' 
  },
  currentDay: { 
    backgroundColor: '#4DA3FF' 
  },
  dayText: { 
    fontSize: 16, 
    color: '#000' 
  },
  adjacentDayText: { 
    fontSize: 16,
     color: '#A0A0A0' 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
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