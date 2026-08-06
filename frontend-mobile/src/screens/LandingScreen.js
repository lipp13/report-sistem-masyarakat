import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../theme/lapormasTheme";

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <View style={styles.bg}>
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
        <View style={[styles.blob, styles.blob3]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>Pengaduan masyarakat — cepat & transparan</Text>

        <Text style={styles.headline}>
          Laporkan masalah di lingkunganmu,{" "}
          <Text style={styles.headlineAccent}>pantau statusnya </Text>
          dalam satu sistem.
        </Text>

        <Text style={styles.lead}>
          Kirim laporan dengan foto dan lokasi di peta, pantau tanggapan petugas,
          dan ikuti perkembangan pengaduan hingga selesai.
        </Text>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate("Login")}
          activeOpacity={0.9}
        >
          <Text style={styles.btnPrimaryText}>Masuk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate("Register")}
          activeOpacity={0.9}
        >
          <Text style={styles.btnOutlineText}>Daftar akun baru</Text>
        </TouchableOpacity>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Mengapa LaporMas?</Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureH}>Lokasi di peta</Text>
            <Text style={styles.featureP}>
              Tandai lokasi kejadian agar penanganan lebih akurat.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📸</Text>
            <Text style={styles.featureH}>Bukti foto</Text>
            <Text style={styles.featureP}>
              Lampirkan gambar untuk mendukung laporan Anda.
            </Text>
          </View>

          <View style={[styles.featureCard, styles.featureCardLast]}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureH}>Kolom komentar</Text>
            <Text style={styles.featureP}>
              Diskusi dengan pengurus laporan secara terbuka.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>© LaporMas</Text>
      </ScrollView>
    </View>
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
    top: -70,
    right: -60,
  },
  blob2: {
    width: 240,
    height: 240,
    backgroundColor: theme.blue,
    bottom: -50,
    left: -55,
  },
  blob3: {
    width: 180,
    height: 180,
    backgroundColor: theme.teal,
    top: "36%",
    left: "22%",
    opacity: 0.12,
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 56,
    paddingBottom: 36,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: theme.blue,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  headline: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.text,
    lineHeight: 32,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  headlineAccent: {
    color: theme.lavender,
  },
  lead: {
    fontSize: 15,
    color: theme.subtext0,
    lineHeight: 23,
    marginBottom: 26,
  },
  btnPrimary: {
    backgroundColor: theme.blue,
    paddingVertical: 15,
    borderRadius: theme.radiusSm,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: theme.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    color: theme.base,
    fontSize: 16,
    fontWeight: "800",
  },
  btnOutline: {
    paddingVertical: 14,
    borderRadius: theme.radiusSm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.surface2,
    backgroundColor: theme.surface1,
    marginBottom: 36,
  },
  btnOutlineText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "700",
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.text,
    marginBottom: 14,
  },
  features: {
    marginBottom: 28,
  },
  featureCard: {
    backgroundColor: theme.surface0,
    borderWidth: 1,
    borderColor: theme.surface1,
    borderRadius: theme.radius,
    padding: 16,
    marginBottom: 10,
  },
  featureCardLast: {
    marginBottom: 0,
  },
  featureIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  featureH: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 6,
  },
  featureP: {
    fontSize: 13,
    color: theme.subtext0,
    lineHeight: 19,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: theme.overlay,
  },
});
