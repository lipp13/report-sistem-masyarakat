import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme/lapormasTheme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "Login gagal. Periksa koneksi dan kredensial.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.bg}>
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
        <View style={[styles.blob, styles.blob3]} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.navigate("Landing")}>
          <Text style={styles.backHome}>← Beranda</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.logoEmoji}>🏛️</Text>
            <Text style={styles.title}>LaporMas</Text>
            <Text style={styles.subtitle}>
              Sistem pelaporan pengaduan masyarakat
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan email"
              placeholderTextColor={theme.overlay}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, styles.inputPass]}
                placeholder="Password"
                placeholderTextColor={theme.overlay}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eye}
                onPress={() => setShowPass(!showPass)}
              >
                <Text style={styles.eyeText}>{showPass ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.base} />
            ) : (
              <Text style={styles.btnPrimaryText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.switchText}>Belum punya akun? Daftar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.base,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.35,
  },
  blob1: {
    width: 280,
    height: 280,
    backgroundColor: theme.mauve,
    top: -80,
    right: -60,
  },
  blob2: {
    width: 240,
    height: 240,
    backgroundColor: theme.blue,
    bottom: -40,
    left: -50,
  },
  blob3: {
    width: 180,
    height: 180,
    backgroundColor: theme.teal,
    top: "38%",
    left: "25%",
    opacity: 0.12,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingVertical: 48,
  },
  backHome: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: theme.blue,
    marginBottom: 14,
  },
  card: {
    backgroundColor: theme.surface0,
    borderRadius: theme.radiusLg,
    borderWidth: 1,
    borderColor: theme.surface1,
    padding: 24,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 22,
  },
  logoEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.subtext0,
    textAlign: "center",
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.subtext0,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.surface1,
    borderWidth: 1,
    borderColor: theme.surface2,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  passRow: {
    position: "relative",
  },
  inputPass: {
    paddingRight: 48,
  },
  eye: {
    position: "absolute",
    right: 8,
    top: 10,
    padding: 6,
  },
  eyeText: {
    fontSize: 18,
  },
  error: {
    color: theme.red,
    fontSize: 14,
    marginBottom: 12,
  },
  btnPrimary: {
    backgroundColor: theme.blue,
    borderRadius: theme.radiusSm,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
    shadowColor: theme.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.65 },
  btnPrimaryText: {
    color: theme.base,
    fontSize: 16,
    fontWeight: "700",
  },
  switchText: {
    marginTop: 14,
    textAlign: "center",
    color: theme.mauve,
    fontWeight: "600",
  },
});
