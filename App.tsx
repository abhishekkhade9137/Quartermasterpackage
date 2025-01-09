import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
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

function InventoryScreen() {
  const { inventory, setInventory } = useContext(InventoryContext);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const addItem = () => {
    if (itemName.trim() && itemQuantity.trim() && !isNaN(Number(itemQuantity))) {
      if (editingItem) {
        // Edit existing item
        setInventory((prevInventory: any) =>
          prevInventory.map((item: any) =>
            item.id === editingItem.id
              ? { ...item, name: itemName, quantity: itemQuantity }
              : item
          )
        );
        setEditingItem(null);
      } else {
        // Add new item
        const newItem: InventoryItem = {
          id: Math.random().toString(),
          name: itemName,
          quantity: itemQuantity,
        };
        setInventory((prevInventory: any) => [...prevInventory, newItem]);
      }
      setItemName('');
      setItemQuantity('');
    } else {
      Alert.alert('Invalid Input', 'Please enter valid item name and quantity.');
    }
  };

  const deleteItem = (id: string) => {
    setInventory((prevInventory: any) =>
      prevInventory.filter((item: any) => item.id !== id)
    );
  };

  const startEditing = (item: InventoryItem) => {
    setItemName(item.name);
    setItemQuantity(item.quantity);
    setEditingItem(item);
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
      <Button
        title={editingItem ? 'Update Item' : 'Add Item'}
        onPress={addItem}
      />

      <Text style={styles.listTitle}>Inventory List</Text>
      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => startEditing(item)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteItem(item.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function DashboardScreen() {
  const { inventory } = useContext(InventoryContext);

  const pieChartData = inventory.map((item: any) => ({
    name: item.name,
    population: parseFloat(item.quantity),
    color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const barChartData = {
    labels: inventory.map((item: any) => item.name),
    datasets: [
      {
        data: inventory.map((item: any) => parseFloat(item.quantity)),
      },
    ],
  };

  return (
    <View style={styles.content}>
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
    </View>
  );
}

function App(): React.JSX.Element {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

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
  listTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#ffa500',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#ff0000',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  itemText: {
    fontSize: 16,
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
