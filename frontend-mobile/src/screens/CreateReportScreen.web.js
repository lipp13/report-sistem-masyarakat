import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Platform,
  ToastAndroid,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../api/client";
import { theme } from "../theme/lapormasTheme";

function parseCoordInput(s) {
  const t = String(s || "").trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function CreateReportScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [latitudeStr, setLatitudeStr] = useState("");
  const [longitudeStr, setLongitudeStr] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCat, setLoadingCat] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/categories");
        const list = res.data.data || [];
        setCategories(list);
        if (list[0]) setCategoryId(list[0].id);
      } catch {
        Alert.alert(
          "Error",
          "Gagal memuat kategori. Pastikan backend berjalan.",
        );
      } finally {
        setLoadingCat(false);
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin", "Akses galeri diperlukan untuk melampirkan foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0]);
    }
  };

  const submit = async () => {
    if (!title.trim() || !description.trim() || !categoryId) {
      Alert.alert("Validasi", "Judul, deskripsi, dan kategori wajib diisi.");
      return;
    }

    const lat = parseCoordInput(latitudeStr);
    const lng = parseCoordInput(longitudeStr);
    const partialCoords =
      (latitudeStr.trim() || longitudeStr.trim()) &&
      (lat === null || lng === null);
    if (partialCoords) {
      Alert.alert(
        "Koordinat",
        "Isi latitude dan longitude dengan angka yang valid, atau kosongkan keduanya.",
      );
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("category_id", String(categoryId));
      if (location.trim()) form.append("location", location.trim());
      if (lat !== null && lng !== null) {
        form.append("latitude", String(lat));
        form.append("longitude", String(lng));
      }
      if (image?.uri) {
        const uri = image.uri;
        const name = uri.split("/").pop() || "laporan.jpg";
        const extMatch = /\.(\w+)$/.exec(name);
        const type = extMatch
          ? `image/${extMatch[1] === "jpg" ? "jpeg" : extMatch[1]}`
          : "image/jpeg";
        form.append("image", { uri, name, type });
      }
      const res = await api.post("/reports", form);
      const createdId = res.data?.data?.id;
      const msg = "Laporan berhasil dikirim!";
      if (Platform.OS === "android") {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      } else {
        Alert.alert("Berhasil", msg);
      }

      if (createdId) {
        navigation.replace("ReportDetail", { id: createdId });
      } else {
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert(
        "Gagal",
        e.response?.data?.message || "Tidak dapat mengirim laporan.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingCat) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.blue} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.inner}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.lead}>
        Sampaikan pengaduan dengan jelas agar cepat ditindak.
      </Text>

      <View style={styles.panel}>
        <Text style={styles.sectionLabel}>Kategori *</Text>
        <View style={styles.catGrid}>
          {categories.map((c) => {
            const selected = categoryId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.catBtn,
                  selected && {
                    borderColor: c.color || theme.blue,
                    backgroundColor: `${c.color}22`,
                  },
                ]}
                onPress={() => setCategoryId(c.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.catEmoji}>{c.icon}</Text>
                <Text
                  style={[styles.catName, selected && { color: theme.text }]}
                  numberOfLines={2}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Judul *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ringkas masalah"
          placeholderTextColor={theme.overlay}
          maxLength={200}
        />
        <Text style={styles.counter}>{title.length}/200</Text>

        <Text style={styles.sectionLabel}>Deskripsi *</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Jelaskan detail kejadian, waktu, dan dampaknya"
          placeholderTextColor={theme.overlay}
          multiline
        />

        <Text style={styles.sectionLabel}>Lokasi (web)</Text>
        <Text style={styles.mapHint}>
          Peta interaktif tersedia di aplikasi Android/iOS. Di web, isi koordinat
          secara manual jika perlu (opsional).
        </Text>
        <TextInput
          style={styles.input}
          value={latitudeStr}
          onChangeText={setLatitudeStr}
          placeholder="Latitude, contoh: -6.2088"
          placeholderTextColor={theme.overlay}
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, styles.coordSecond]}
          value={longitudeStr}
          onChangeText={setLongitudeStr}
          placeholder="Longitude, contoh: 106.8456"
          placeholderTextColor={theme.overlay}
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />

        <Text style={[styles.sectionLabel, styles.sectionAfterMap]}>
          Keterangan alamat (opsional)
        </Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Patokan atau nama jalan"
          placeholderTextColor={theme.overlay}
        />

        <Text style={styles.sectionLabel}>Foto bukti (opsional)</Text>
        <TouchableOpacity
          style={styles.dropzone}
          onPress={pickImage}
          activeOpacity={0.85}
        >
          {image?.uri ? (
            <Image source={{ uri: image.uri }} style={styles.preview} />
          ) : (
            <View style={styles.dropInner}>
              <Text style={styles.dropIcon}>📸</Text>
              <Text style={styles.dropTitle}>Tap untuk pilih gambar</Text>
              <Text style={styles.dropHint}>JPG, PNG (max 5MB di server)</Text>
            </View>
          )}
        </TouchableOpacity>
        {image?.uri ? (
          <TouchableOpacity onPress={() => setImage(null)}>
            <Text style={styles.removeImg}>Hapus foto</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>💡 Tips laporan yang baik</Text>
        <Text style={styles.tipsLine}>• Judul spesifik dan kategori tepat</Text>
        <Text style={styles.tipsLine}>• Cantumkan lokasi dan bukti foto</Text>
        <Text style={styles.tipsLine}>• Jelaskan dampak bagi warga</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnGhost}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnGhostText}>Batal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnSubmit, loading && styles.btnDisabled]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.base} />
          ) : (
            <Text style={styles.btnSubmitText}>📤 Kirim laporan</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.base,
  },
  inner: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.base,
  },
  lead: {
    fontSize: 14,
    color: theme.subtext0,
    marginBottom: 16,
    lineHeight: 20,
  },
  panel: {
    backgroundColor: theme.surface0,
    borderRadius: theme.radiusLg,
    borderWidth: 1,
    borderColor: theme.surface1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.subtext0,
    marginBottom: 8,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    marginBottom: 12,
  },
  catBtn: {
    width: "31%",
    margin: "1%",
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    backgroundColor: theme.surface1,
    borderRadius: theme.radiusSm,
    borderWidth: 2,
    borderColor: theme.surface2,
  },
  catEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  catName: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.subtext0,
    textAlign: "center",
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
  coordSecond: {
    marginTop: 10,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  counter: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: theme.overlay,
    marginTop: 4,
    marginBottom: 8,
  },
  mapHint: {
    fontSize: 12,
    color: theme.overlay,
    marginBottom: 10,
    lineHeight: 17,
  },
  sectionAfterMap: {
    marginTop: 12,
  },
  dropzone: {
    minHeight: 160,
    borderWidth: 2,
    borderColor: theme.surface2,
    borderStyle: "dashed",
    borderRadius: theme.radius,
    overflow: "hidden",
    backgroundColor: theme.surface1,
  },
  dropInner: {
    flex: 1,
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  dropIcon: { fontSize: 36, marginBottom: 8 },
  dropTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 4,
  },
  dropHint: { fontSize: 12, color: theme.overlay },
  preview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  removeImg: {
    color: theme.red,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  tips: {
    marginTop: 16,
    padding: 14,
    backgroundColor: theme.mantle,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.surface1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.yellow,
    marginBottom: 8,
  },
  tipsLine: {
    fontSize: 13,
    color: theme.subtext0,
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    flexWrap: "wrap",
  },
  btnGhost: {
    marginRight: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.surface2,
    backgroundColor: theme.surface1,
  },
  btnGhostText: {
    color: theme.text,
    fontWeight: "600",
  },
  btnSubmit: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.green,
    minWidth: 160,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.65 },
  btnSubmitText: {
    color: theme.base,
    fontWeight: "800",
    fontSize: 15,
  },
});
