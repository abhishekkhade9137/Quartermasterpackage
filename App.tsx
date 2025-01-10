import React, { useState } from 'react';
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
SafeAreaView,
StatusBar,
@@ -7,23 +7,31 @@ import {
Text,
TextInput,
Button,
  ScrollView,
  FlatList,
Dimensions,
Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PieChart, BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

// Context for shared inventory state
const InventoryContext = createContext({
  inventory: [],
  setInventory: (value: any) => {},
});

type InventoryItem = {
id: string;
name: string;
quantity: string;
};

function InventoryScreen({ setInventory }: { setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>> }) {
function InventoryScreen() {
  const { inventory, setInventory } = useContext(InventoryContext);
const [itemName, setItemName] = useState('');
const [itemQuantity, setItemQuantity] = useState('');

@@ -34,7 +42,7 @@ function InventoryScreen({ setInventory }: { setInventory: React.Dispatch<React.
name: itemName,
quantity: itemQuantity,
};
      setInventory((prevInventory) => [...prevInventory, newItem]);
      setInventory((prevInventory: any) => [...prevInventory, newItem]);
setItemName('');
setItemQuantity('');
} else {
@@ -58,30 +66,44 @@ function InventoryScreen({ setInventory }: { setInventory: React.Dispatch<React.
keyboardType="numeric"
/>
<Button title="Add Item" onPress={addItem} />

      <Text style={styles.listTitle}>Inventory List</Text>
      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
          </View>
        )}
      />
</View>
);
}

function DashboardScreen({ inventory }: { inventory: InventoryItem[] }) {
  const pieChartData = inventory.map((item) => ({
function DashboardScreen() {
  const { inventory } = useContext(InventoryContext);

  const pieChartData = inventory.map((item: any) => ({
name: item.name,
population: parseFloat(item.quantity),
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
legendFontColor: '#7F7F7F',
legendFontSize: 15,
}));

const barChartData = {
    labels: inventory.map((item) => item.name),
    labels: inventory.map((item: any) => item.name),
datasets: [
{
        data: inventory.map((item) => parseFloat(item.quantity)),
        data: inventory.map((item: any) => parseFloat(item.quantity)),
},
],
};

return (
    <ScrollView style={styles.content}>
    <View style={styles.content}>
<Text style={styles.dashboardText}>Inventory Overview</Text>
<Text style={styles.chartTitle}>Pie Chart</Text>
<PieChart
@@ -112,42 +134,63 @@ function DashboardScreen({ inventory }: { inventory: InventoryItem[] }) {
}}
style={{ marginVertical: 8 }}
/>
    </ScrollView>
    </View>
);
}

function App(): React.JSX.Element {
const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const backgroundStyle = {
    backgroundColor: '#ffffff',
  };

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const storedInventory = await AsyncStorage.getItem('inventory');
        if (storedInventory) {
          setInventory(JSON.parse(storedInventory));
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load inventory');
      }
    };
    loadInventory();
  }, []);

  useEffect(() => {
    const saveInventory = async () => {
      try {
        await AsyncStorage.setItem('inventory', JSON.stringify(inventory));
      } catch (error) {
        Alert.alert('Error', 'Failed to save inventory');
      }
    };
    saveInventory();
  }, [inventory]);

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
    <InventoryContext.Provider value={{ inventory, setInventory }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: 'tomato',
              tabBarInactiveTintColor: 'gray',
            }}
          >
            <Tab.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ tabBarLabel: 'Dashboard' }}
            />
            <Tab.Screen
              name="Inventory"
              component={InventoryScreen}
              options={{ tabBarLabel: 'Inventory' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </InventoryContext.Provider>
);
}

@@ -166,6 +209,21 @@ const styles = StyleSheet.create({
marginBottom: 12,
paddingHorizontal: 8,
},
  listTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
  },
dashboardText: {
fontSize: 18,
textAlign: 'center',
@@ -178,4 +236,4 @@ const styles = StyleSheet.create({
},
});

export default App;
export default App;