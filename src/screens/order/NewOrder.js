import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Background from '../../components/auth/Background';
import TextInput from '../../components/auth/TextInput';
import axios from 'axios';
import Logo from '../../components/auth/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NewOrder = ({ navigation }) => {

    // todo: change this later to drop down with retrieved data from database
    const maxBudget = 100000;
    const [siteManagerID, setSiteManagerID] = React.useState('');
    const [siteManagerName, setSiteManagerName] = React.useState('');
    const [siteName, setSiteName] = React.useState({ value: '', error: '' });
    const [itemName, setItemName] = React.useState({ value: '', error: '' });
    const [quantity, setQuantity] = React.useState({ value: 0.0, error: '' });
    const [size, setSize] = React.useState({ value: '', error: '' });
    const [unitPrice, setUnitPrice] = React.useState({ value: 0.0, error: '' });
    const [totalPrice, setTotalPrice] = React.useState({ value: '', error: '' });
    const [storedItemList, setStoredItemList] = React.useState([]);

    useEffect(() => {

        handleUserToken();
        axios.get('http://192.168.1.103:5000/itemDetails/getall').then((response) => {
            //console.log(response.data);
            if (response.data.success) {
                setStoredItemList(response.data.existingItemDetails);
            }
        });
    }, []);

    const handleUserToken = async () => {
        const userData = await AsyncStorage.getItem('loggedUserData');
        const userDataArray = JSON.parse(userData);
        setSiteManagerID(userDataArray.userID);
        setSiteManagerName(userDataArray.userName);
      }

    const onOrderPressed = () => {

        if (siteName.value === '') {
            setSiteName({ ...siteName, error: 'Site name cannot be empty' });
        }
        else if (itemName.value === '') {
            setItemName({ ...itemName, error: 'Item name cannot be empty' });
        }
        else if (quantity.value === '') {
            setQuantity({ ...quantity, error: 'Quantity cannot be empty' });
        }
        else if (unitPrice.value === '') {
            setUnitPrice({ ...unitPrice, error: 'Cannot find the unit price' });
        }
        //else if (totalPrice === '') {
        //    setTotalPrice({ ...totalPrice, error: 'Total cannot be calculated' });
        //}
        else if (size.value === '') {
            setSize({ ...size, error: 'Size cannot be empty' });
        }
        else {
            itemName.error = '';
            quantity.error = '';
            unitPrice.error = '';
            //totalPrice.error = '';
            size.error = '';
            siteName.error = '';
        }

        if (itemName.value==='' || quantity.value==='' || unitPrice.value==='' || size.value==='' || siteName.value==='') {
            Alert.alert('Error', 'Please check the fields again', [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        }
        else {
            setTotalPrice({ value: (quantity.value * unitPrice.value).toString() });
            let status = '';
            if (totalPrice.value > maxBudget) {
                status = 'Need approval';
            }
            else {
                status = 'Waiting for a supplier';
            }
            const order = {
                site: siteName.value,
                siteManagerID: siteManagerID,
                siteManagerName: siteManagerName,
                items: {
                    name: itemName.value,
                    size: size.value,
                    quantity: quantity.value,
                    unitPrice: unitPrice.value,
                    orderStatus: "Pending",
                    receivedAmount: 0,
                    updatedDate: new Date().toString()
                },
                status: status,
                expectedBudget: totalPrice.value,
                acceptedSupplier: "",
                actualAmount: 0.0,
                createdDate: new Date().toString(),
            }
            //console.log(order);
            axios.post('http://192.168.1.103:5000/tender/add', order)
                .then((response) => {
                    if (response.data.success) {
                        alert("Successfully added the order");
                        setTimeout(() => {
                            navigation.navigate('Home');
                        }, 20)
                    }
                    else {
                        alert("Error while adding the order, Please try again");
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    //alert("Creating record failed");
                });
        }
    }

    return (
        <ScrollView>
            <Background>
                <Logo />
                <TextInput
                    label="Site Name"
                    returnKeyType="next"
                    value={siteName.value}
                    onChangeText={(text) => setSiteName({ value: text, error: '' })}
                    error={!!siteName.error}
                    errorText={siteName.error}
                    autoCapitalize="none"
                    autoCompleteType="text"
                    textContentType="text"
                    keyboardType="text"
                />
                <TextInput
                    label="Item Name"
                    returnKeyType="next"
                    value={itemName.value}
                    onChangeText={(text) => setItemName({ value: text, error: '' })}
                    error={!!itemName.error}
                    errorText={itemName.error}
                    autoCapitalize="none"
                    autoCompleteType="text"
                    textContentType="text"
                    keyboardType="text"
                />
                <TextInput
                    label="Size"
                    returnKeyType="next"
                    value={size.value}
                    onChangeText={(text) => setSize({ value: text, error: '' })}
                    error={!!size.error}
                    errorText={size.error}
                    autoCapitalize="none"
                    autoCompleteType="text"
                    textContentType="text"
                    keyboardType="text"
                />
                <TextInput
                    label="Quantity"
                    returnKeyType="next"
                    value={quantity.value}
                    onChangeText={(number) => setQuantity({ value: number, error: '' })}
                    error={!!quantity.error}
                    errorText={quantity.error}
                    autoCapitalize="none"
                    autoCompleteType="number"
                    textContentType="number"
                    keyboardType="numeric"
                />
                <TextInput
                    label="Unit Price"
                    returnKeyType="next"
                    value={unitPrice.value}
                    onChangeText={(number) => setUnitPrice({ value: number, error: '' })}
                    error={!!unitPrice.error}
                    errorText={unitPrice.error}
                    autoCapitalize="none"
                    autoCompleteType="number"
                    textContentType="number"
                    keyboardType="numeric"
                />

                <TouchableOpacity
                    style={styles.button}
                    testID='addOrderButton'
                    onPress={() => { onOrderPressed() }}
                >
                    <Text style={styles.text}>Add Order</Text>
                </TouchableOpacity>
            </Background>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    button: {
        minWidth: 300,
        marginVertical: 20,
        paddingVertical: 2,
        backgroundColor: '#FFA500',
        color: 'black',
        borderRadius: 20,
    },
    text: {
        fontWeight: 'bold',
        fontSize: 15,
        lineHeight: 26,
        textAlign: 'center',
    },
})