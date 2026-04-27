import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    Pressable,
    SafeAreaView,
    StatusBar,
    Platform,
    ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ─── Colour system ───────────────────────────────────────────────
const COLORS = {
    background: "#F8F9FB",
    white: "#FFFFFF",
    text: "#1A1A1A",
    textSub: "#7A7A7A",
    border: "#EAEAEA",
    blue: "#005eff",
    success: "#4CAF50",
    warning: "#FF9500",
    danger: "#FF3B30",
    tipBg: "#F0F4FF",
};

// Severity → colour mapping
const SEVERITY_COLOR = {
    healthy: COLORS.success,
    mild: COLORS.warning,
    moderate: COLORS.warning,
    severe: COLORS.danger,
    unknown: COLORS.textSub,
};

// Urgency → readable label
const URGENCY_LABEL = {
    urgent: "⚠️  See a dentist within 1 week",
    soon: "🗓  See a dentist within 1 month",
    routine: "✅  Routine 6-month check-up",
    unknown: "💬  Consult a dentist for advice",
};

// Condition → icon name
const CONDITION_ICON = {
    cavity: "tooth-outline",
    plaque: "water-outline",
    gingivitis: "fitness-outline",
    healthy: "checkmark-circle-outline",
};

export default function ResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse the data passed from home.jsx via router params
    // All params come as strings so we parse JSON where needed
    const analysisId = params.analysisId || "";
    const imageUrl = params.imageUrl || "";
    const diagnosisResult = params.diagnosisResult || "Analysis complete";
    const severity = params.severity || "unknown";
    const urgency = params.urgency || "unknown";
    const estimatedCost = params.estimatedCostINR || "";
    const geminiAnalysed = params.geminiAnalysed === "true";
    const confidence = params.confidence ? parseFloat(params.confidence) : null;

    // Parse arrays from JSON strings
    const [conditions, setConditions] = useState([]);
    const [tips, setTips] = useState([]);
    const [disclaimer, setDisclaimer] = useState("");

    useEffect(() => {
        try {
            setConditions(params.conditions ? JSON.parse(params.conditions) : []);
        } catch { setConditions([]); }

        try {
            setTips(params.geminiTips ? JSON.parse(params.geminiTips) : []);
        } catch { setTips([]); }

        setDisclaimer(params.geminiDisclaimer || "");
    }, []);

    const severityColor = SEVERITY_COLOR[severity] || COLORS.textSub;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <Pressable onPress={() => router.replace("/home")} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Analysis Result</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >

                {/* ── Captured Image ── */}
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                        <Ionicons name="image-outline" size={48} color={COLORS.border} />
                    </View>
                )}

                {/* ── Diagnosis Summary Card ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Diagnosis</Text>
                    <Text style={styles.diagnosisText}>{diagnosisResult}</Text>

                    {/* Detected conditions as badges */}
                    {conditions.length > 0 && (
                        <View style={styles.badgeRow}>
                            {conditions.map((c, i) => (
                                <View key={i} style={[styles.badge, { borderColor: severityColor }]}>
                                    <Ionicons
                                        name={CONDITION_ICON[c] || "alert-circle-outline"}
                                        size={14}
                                        color={severityColor}
                                    />
                                    <Text style={[styles.badgeText, { color: severityColor }]}>
                                        {c.charAt(0).toUpperCase() + c.slice(1)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Confidence score */}
                    {confidence !== null && (
                        <Text style={styles.confidenceText}>
                            Model confidence: {Math.round(confidence * 100)}%
                        </Text>
                    )}
                </View>

                {/* ── Urgency Card ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Recommendation</Text>
                    <Text style={[styles.urgencyText, { color: severityColor }]}>
                        {URGENCY_LABEL[urgency] || URGENCY_LABEL.unknown}
                    </Text>
                    {estimatedCost ? (
                        <Text style={styles.costText}>
                            💰  Estimated cost: {estimatedCost}
                        </Text>
                    ) : null}
                </View>

                {/* ── AI Tips Card ── */}
                <View style={styles.card}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="sparkles" size={18} color={COLORS.blue} />
                        <Text style={styles.cardTitle}> AI Dental Tips</Text>
                    </View>

                    {tips.length > 0 ? (
                        tips.map((tip, i) => (
                            <View key={i} style={styles.tipRow}>
                                <View style={styles.tipBullet} />
                                <Text style={styles.tipText}>{tip}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noTipsText}>
                            {geminiAnalysed
                                ? "No tips available."
                                : "AI tips could not be generated. You can retry from History."}
                        </Text>
                    )}

                    {disclaimer ? (
                        <Text style={styles.disclaimer}>{disclaimer}</Text>
                    ) : null}
                </View>

                {/* ── Consult a Doctor Button ── */}
                {/* Always shown — see reasoning in design doc */}
                <Pressable
                    style={({ pressed }) => [
                        styles.consultBtn,
                        pressed && { opacity: 0.85 }
                    ]}
                    onPress={() =>
                        router.push({
                            pathname: "/consult",
                            params: { analysisId, diagnosisResult, conditions: JSON.stringify(conditions), imageUrl }
                        })
                    }
                >
                    <Ionicons name="medkit-outline" size={22} color={COLORS.white} />
                    <Text style={styles.consultBtnText}>Consult a Doctor</Text>
                </Pressable>

                {/* ── View History Button ── */}
                <Pressable
                    style={({ pressed }) => [
                        styles.historyBtn,
                        pressed && { opacity: 0.8 }
                    ]}
                    onPress={() => router.push("/history")}
                >
                    <Ionicons name="time-outline" size={20} color={COLORS.blue} />
                    <Text style={styles.historyBtnText}>View Full History</Text>
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
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
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.text,
    },
    scroll: {
        padding: 16,
        paddingBottom: 40,
    },
    image: {
        width: "100%",
        height: 220,
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: COLORS.border,
    },
    imagePlaceholder: {
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.textSub,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    diagnosisText: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 10,
    },
    badgeRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        backgroundColor: COLORS.white,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: "600",
    },
    confidenceText: {
        fontSize: 13,
        color: COLORS.textSub,
        marginTop: 4,
    },
    urgencyText: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    costText: {
        fontSize: 14,
        color: COLORS.textSub,
        marginTop: 4,
    },
    tipsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    tipRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 10,
    },
    tipBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.blue,
        marginTop: 7,
        flexShrink: 0,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 22,
    },
    noTipsText: {
        fontSize: 14,
        color: COLORS.textSub,
        fontStyle: "italic",
    },
    disclaimer: {
        fontSize: 12,
        color: COLORS.textSub,
        fontStyle: "italic",
        marginTop: 12,
        lineHeight: 18,
    },
    consultBtn: {
        backgroundColor: COLORS.blue,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 16,
        borderRadius: 14,
        marginBottom: 12,
        shadowColor: COLORS.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    consultBtnText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "700",
    },
    historyBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: COLORS.blue,
        backgroundColor: COLORS.white,
        marginBottom: 12,
    },
    historyBtnText: {
        color: COLORS.blue,
        fontSize: 16,
        fontWeight: "600",
    },
});