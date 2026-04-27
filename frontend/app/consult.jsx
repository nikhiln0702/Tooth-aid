import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
    TextInput,
    Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

const COLORS = {
    background: "#F8F9FB",
    white: "#FFFFFF",
    text: "#1A1A1A",
    textSub: "#7A7A7A",
    border: "#EAEAEA",
    blue: "#005eff",
    success: "#4CAF50",
    selected: "#005eff",
    selectedBg: "#EEF3FF",
};

// Generate next 7 days for the date picker
const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push({
            date: d.toISOString().split("T")[0], // YYYY-MM-DD
            display: d.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short"
            }),
            isToday: i === 0
        });
    }
    return days;
};

export default function ConsultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const imageUrl = params.imageUrl || "";
    const analysisId = params.analysisId || "";
    const diagnosisResult = params.diagnosisResult || "Dental issue detected";

    // State
    const [eventTypes, setEventTypes] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [booking, setBooking] = useState(false);
    const [booked, setBooked] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);

    const days = getNext7Days();

    // Load user info and event types on mount
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            // Pre-fill name and email from stored token if possible
            // Also fetch event types from Cal.com
            const res = await axios.get(
                `${API_ENDPOINTS.BASE}/api/consult/event-types`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const types = res.data.eventTypes || [];
            setEventTypes(types);

            // Auto-select first event type (Dental Consultation)
            if (types.length > 0) {
                setSelectedEvent(types[0]);
            }

        } catch (err) {
            console.error("Failed to load event types:", err.message);
            Alert.alert("Error", "Failed to load consultation types. Please try again.");
        } finally {
            setLoadingEvents(false);
        }
    };

    // Fetch slots when date or event type changes
    useEffect(() => {
        if (selectedDate && selectedEvent) {
            fetchSlots();
        }
    }, [selectedDate, selectedEvent]);

    const fetchSlots = async () => {
        setLoadingSlots(true);
        setSlots([]);
        setSelectedSlot(null);
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await axios.get(
                `${API_ENDPOINTS.BASE}/api/consult/slots`,
                {
                    params: {
                        eventTypeId: selectedEvent.id,
                        date: selectedDate
                    },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setSlots(res.data.slots || []);
        } catch (err) {
            console.error("Failed to fetch slots:", err.message);
            Alert.alert("Error", "Failed to load available slots.");
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBook = async () => {
        if (!selectedEvent || !selectedSlot || !name || !email) {
            Alert.alert("Missing Info", "Please fill in your name, email, and select a time slot.");
            return;
        }

        // Basic email validation
        if (!email.includes("@")) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        setBooking(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await axios.post(
                `${API_ENDPOINTS.BASE}/api/consult/book`,
                {
                    eventTypeId: selectedEvent.id,
                    start: selectedSlot.time,
                    name,
                    email,
                    analysisId,
                    notes: `Patient diagnosed with: ${diagnosisResult}. Scan image: ${imageUrl}. Booked via ToothAid.`
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setBookingDetails(res.data);
            setBooked(true);

        } catch (err) {
            console.error("Booking error:", err.response?.data || err.message);
            Alert.alert(
                "Booking Failed",
                err.response?.data?.error || "Something went wrong. Please try again."
            );
        } finally {
            setBooking(false);
        }
    };

    // ── SUCCESS SCREEN ──
    if (booked && bookingDetails) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <ScrollView contentContainerStyle={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
                    </View>
                    <Text style={styles.successTitle}>Appointment Booked!</Text>
                    <Text style={styles.successSubtitle}>
                        Your dental consultation has been confirmed.
                    </Text>

                    <View style={styles.bookingCard}>
                        <View style={styles.bookingRow}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.blue} />
                            <Text style={styles.bookingText}>
                                {new Date(bookingDetails.start).toLocaleDateString("en-IN", {
                                    weekday: "long", day: "numeric",
                                    month: "long", year: "numeric",
                                    timeZone: "Asia/Kolkata"
                                })}
                            </Text>
                        </View>
                        <View style={styles.bookingRow}>
                            <Ionicons name="time-outline" size={20} color={COLORS.blue} />
                            <Text style={styles.bookingText}>
                                {new Date(bookingDetails.start).toLocaleTimeString("en-IN", {
                                    hour: "2-digit", minute: "2-digit",
                                    hour12: true, timeZone: "Asia/Kolkata"
                                })}
                            </Text>
                        </View>
                        {bookingDetails.meetLink && (
                            <View style={styles.bookingRow}>
                                <Ionicons name="videocam-outline" size={20} color={COLORS.blue} />
                                <Text style={[styles.bookingText, { color: COLORS.blue }]}>
                                    Video link will be sent to your email
                                </Text>
                            </View>
                        )}
                        <View style={styles.bookingRow}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.blue} />
                            <Text style={styles.bookingText}>
                                Confirmation sent to {email}
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        style={styles.doneBtn}
                        onPress={() => router.replace("/home")}
                    >
                        <Text style={styles.doneBtnText}>Back to Home</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ── BOOKING SCREEN ──
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Book a Dentist</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Diagnosis context */}
                <View style={styles.contextCard}>
                    <Ionicons name="information-circle-outline" size={18} color={COLORS.blue} />
                    <Text style={styles.contextText}>
                        Booking consultation for: <Text style={{ fontWeight: "700" }}>{diagnosisResult}</Text>
                    </Text>
                </View>

                {/* Event Types */}
                {loadingEvents ? (
                    <ActivityIndicator color={COLORS.blue} style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Consultation Type</Text>
                        {eventTypes.map(et => (
                            <Pressable
                                key={et.id}
                                style={[
                                    styles.eventCard,
                                    selectedEvent?.id === et.id && styles.eventCardSelected
                                ]}
                                onPress={() => setSelectedEvent(et)}
                            >
                                <Ionicons
                                    name="medical-outline"
                                    size={20}
                                    color={selectedEvent?.id === et.id ? COLORS.blue : COLORS.textSub}
                                />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[
                                        styles.eventTitle,
                                        selectedEvent?.id === et.id && { color: COLORS.blue }
                                    ]}>
                                        {et.title}
                                    </Text>
                                    <Text style={styles.eventDuration}>{et.duration} minutes</Text>
                                </View>
                                {selectedEvent?.id === et.id && (
                                    <Ionicons name="checkmark-circle" size={22} color={COLORS.blue} />
                                )}
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Date Picker */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {days.map(d => (
                            <Pressable
                                key={d.date}
                                style={[
                                    styles.dayCard,
                                    selectedDate === d.date && styles.dayCardSelected
                                ]}
                                onPress={() => setSelectedDate(d.date)}
                            >
                                <Text style={[
                                    styles.dayText,
                                    selectedDate === d.date && styles.dayTextSelected
                                ]}>
                                    {d.isToday ? "Today" : d.display}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Time Slots */}
                {selectedDate && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Slots</Text>
                        {loadingSlots ? (
                            <ActivityIndicator color={COLORS.blue} />
                        ) : slots.length === 0 ? (
                            <Text style={styles.noSlots}>
                                No slots available for this date. Try another day.
                            </Text>
                        ) : (
                            <View style={styles.slotsGrid}>
                                {slots.map((s, i) => (
                                    <Pressable
                                        key={i}
                                        style={[
                                            styles.slotCard,
                                            selectedSlot?.time === s.time && styles.slotCardSelected
                                        ]}
                                        onPress={() => setSelectedSlot(s)}
                                    >
                                        <Text style={[
                                            styles.slotText,
                                            selectedSlot?.time === s.time && styles.slotTextSelected
                                        ]}>
                                            {s.display}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Patient Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Details</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor={COLORS.textSub}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.textSub}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Book Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.bookBtn,
                        (!selectedSlot || !name || !email) && styles.bookBtnDisabled,
                        pressed && { opacity: 0.85 }
                    ]}
                    onPress={handleBook}
                    disabled={booking || !selectedSlot || !name || !email}
                >
                    {booking ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.white} />
                            <Text style={styles.bookBtnText}>Confirm Booking</Text>
                        </>
                    )}
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: { width: 40, height: 40, justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
    scroll: { padding: 16, paddingBottom: 40 },

    contextCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: COLORS.selectedBg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
    },
    contextText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },

    section: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.textSub,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 12,
    },

    eventCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    eventCardSelected: { borderColor: COLORS.blue, backgroundColor: COLORS.selectedBg },
    eventTitle: { fontSize: 15, fontWeight: "600", color: COLORS.text },
    eventDuration: { fontSize: 13, color: COLORS.textSub, marginTop: 2 },

    dayCard: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        marginRight: 10,
    },
    dayCardSelected: { borderColor: COLORS.blue, backgroundColor: COLORS.selectedBg },
    dayText: { fontSize: 13, fontWeight: "600", color: COLORS.textSub },
    dayTextSelected: { color: COLORS.blue },

    noSlots: { fontSize: 14, color: COLORS.textSub, fontStyle: "italic" },
    slotsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    slotCard: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    slotCardSelected: { borderColor: COLORS.blue, backgroundColor: COLORS.selectedBg },
    slotText: { fontSize: 14, fontWeight: "600", color: COLORS.textSub },
    slotTextSelected: { color: COLORS.blue },

    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: "600", color: COLORS.text, marginBottom: 8 },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: COLORS.text,
    },

    bookBtn: {
        backgroundColor: COLORS.blue,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 16,
        borderRadius: 14,
        shadowColor: COLORS.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    bookBtnDisabled: { opacity: 0.5 },
    bookBtnText: { color: COLORS.white, fontSize: 17, fontWeight: "700" },

    // Success screen
    successContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    successIcon: { marginBottom: 20 },
    successTitle: { fontSize: 26, fontWeight: "800", color: COLORS.text, marginBottom: 8 },
    successSubtitle: { fontSize: 15, color: COLORS.textSub, textAlign: "center", marginBottom: 30 },
    bookingCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        width: "100%",
        marginBottom: 30,
        gap: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    bookingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    bookingText: { fontSize: 15, color: COLORS.text, flex: 1 },
    doneBtn: {
        backgroundColor: COLORS.blue,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 14,
    },
    doneBtnText: { color: COLORS.white, fontSize: 17, fontWeight: "700" },
});