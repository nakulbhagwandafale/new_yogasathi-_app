import { StyleSheet, Text, View } from 'react-native';
import { Card, Divider, Paragraph, Title } from 'react-native-paper';

export default function FoodCard({ plan }) {
    if (!plan) return null;

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <Title style={styles.title}>{plan.meal}</Title>
                    <Text style={styles.calories}>🔥 {plan.calories}</Text>
                </View>
                <Text style={styles.foodName}>{plan.food}</Text>
                <Divider style={styles.divider} />
                <Paragraph style={styles.description}>{plan.description}</Paragraph>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { marginVertical: 8, backgroundColor: '#e8f5e9', elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 18, color: '#1b5e20' },
    calories: { fontSize: 14, color: '#388e3c', fontWeight: 'bold' },
    foodName: { fontSize: 16, color: '#2e7d32', marginTop: 4, fontWeight: '500' },
    divider: { marginVertical: 8, backgroundColor: '#a5d6a7' },
    description: { fontSize: 14, color: '#333', lineHeight: 20 }
});
