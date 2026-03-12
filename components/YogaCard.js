import { StyleSheet, Text } from 'react-native';
import { Card, Divider, Paragraph, Title } from 'react-native-paper';

export default function YogaCard({ plan }) {
    if (!plan) return null;

    return (
        <Card style={styles.card}>
            <Card.Content>
                <Title style={styles.title}>{plan.name}</Title>
                <Text style={styles.duration}>⏱️ {plan.duration}</Text>
                <Divider style={styles.divider} />
                <Paragraph style={styles.description}>{plan.description}</Paragraph>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { marginVertical: 8, backgroundColor: '#e8f5e9', elevation: 2 },
    title: { fontSize: 18, color: '#1b5e20' },
    duration: { fontSize: 14, color: '#388e3c', marginBottom: 5, fontWeight: 'bold' },
    divider: { marginVertical: 8, backgroundColor: '#a5d6a7' },
    description: { fontSize: 14, color: '#333', lineHeight: 20 }
});
