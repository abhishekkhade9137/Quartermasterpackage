import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PieChart, BarChart } from 'react-native-chart-kit';

const Tab = createBottomTabNavigator();

type InventoryItem = {
  id: string;
  name: string;
  quantity: string;
};

function InventoryScreen({ setInventory }: { setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>> }) {
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  const addItem = () => {
    if (itemName.trim() && itemQuantity.trim() && !isNaN(Number(itemQuantity))) {
      const newItem: InventoryItem = {
        id: Math.random().toString(),
        name: itemName,
        quantity: itemQuantity,
      };
      setInventory((prevInventory) => [...prevInventory, newItem]);
      setItemName('');
      setItemQuantity('');
    } else {
      Alert.alert('Invalid Input', 'Please enter valid item name and quantity.');
    }
  };

  return (
    <View style={styles.content}>
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={itemName}
        onChangeText={setItemName}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={itemQuantity}
        onChangeText={setItemQuantity}
        keyboardType="numeric"
      />
      <Button title="Add Item" onPress={addItem} />
    </View>
  );
}

function DashboardScreen({ inventory }: { inventory: InventoryItem[] }) {
  const pieChartData = inventory.map((item) => ({
    name: item.name,
    population: parseFloat(item.quantity),
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const barChartData = {
    labels: inventory.map((item) => item.name),
    datasets: [
      {
        data: inventory.map((item) => parseFloat(item.quantity)),
      },
    ],
  };

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.dashboardText}>Inventory Overview</Text>
      <Text style={styles.chartTitle}>Pie Chart</Text>
      <PieChart
        data={pieChartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <Text style={styles.chartTitle}>Bar Chart</Text>
      <BarChart
        data={barChartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={{ marginVertical: 8 }}
      />
    </ScrollView>
  );
}

function App(): React.JSX.Element {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const backgroundStyle = {
    backgroundColor: '#ffffff',
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          }}
        >
          <Tab.Screen
            name="Dashboard"
            children={() => <DashboardScreen inventory={inventory} />}
            options={{ tabBarLabel: 'Dashboard' }}
          />
          <Tab.Screen
            name="Inventory"
            children={() => <InventoryScreen setInventory={setInventory} />}
            options={{ tabBarLabel: 'Inventory' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  dashboardText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  chartTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default App;