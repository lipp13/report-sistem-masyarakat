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

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async () => {
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Nama, email, dan password wajib diisi.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.navigate("Landing")}>
          <Text style={styles.backHome}>← Beranda</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          <Text style={styles.title}>Daftar Akun User</Text>
          <Text style={styles.subtitle}>Buat akun untuk kirim laporan</Text>

          <Text style={styles.label}>Nama</Text>
          <TextInput
            style={styles.input}
            placeholder="Nama lengkap"
            placeholderTextColor={theme.overlay}
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@contoh.com"
            placeholderTextColor={theme.overlay}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
          />

          <Text style={styles.label}>No. HP (opsional)</Text>
          <TextInput
            style={styles.input}
            placeholder="08xxxxxxxxxx"
            placeholderTextColor={theme.overlay}
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, styles.inputPass]}
              placeholder="Min. 6 karakter"
              placeholderTextColor={theme.overlay}
              secureTextEntry={!showPass}
              value={form.password}
              onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
            />
            <TouchableOpacity
              style={styles.eye}
              onPress={() => setShowPass((s) => !s)}
            >
              <Text style={styles.eyeText}>{showPass ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Konfirmasi Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Ulangi password"
            placeholderTextColor={theme.overlay}
            secureTextEntry={!showPass}
            value={form.confirm}
            onChangeText={(v) => setForm((f) => ({ ...f, confirm: v }))}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.base} />
            ) : (
              <Text style={styles.btnPrimaryText}>Daftar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.switchText}>Sudah punya akun? Masuk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.base },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
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
  },
  title: { fontSize: 24, fontWeight: "700", color: theme.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: theme.subtext0, marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.subtext0,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: theme.surface1,
    borderWidth: 1,
    borderColor: theme.surface2,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.text,
    fontSize: 15,
  },
  passRow: { position: "relative" },
  inputPass: { paddingRight: 46 },
  eye: { position: "absolute", right: 8, top: 9, padding: 6 },
  eyeText: { fontSize: 18 },
  error: { color: theme.red, marginTop: 12, fontSize: 14 },
  btnPrimary: {
    backgroundColor: theme.blue,
    borderRadius: theme.radiusSm,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: theme.base, fontSize: 16, fontWeight: "700" },
  switchText: {
    marginTop: 14,
    textAlign: "center",
    color: theme.mauve,
    fontWeight: "600",
  },
});
