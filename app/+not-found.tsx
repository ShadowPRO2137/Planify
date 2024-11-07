// app/not-found.tsx
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '@/.expo/types/navigationTypes';
import { View, Text, Button } from 'react-native';

export default function NotFoundScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();

  const navigateToTabs = () => {
    navigation.navigate('Tabs');
  };

  return (
    <View>
      <Text>This page does not exist!</Text>
      <Button title="Go to Tabs" onPress={navigateToTabs} />
    </View>
  );
}
