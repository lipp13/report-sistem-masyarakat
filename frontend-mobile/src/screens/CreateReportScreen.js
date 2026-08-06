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
import MapView, { Marker } from "react-native-maps";
import api from "../api/client";
import { theme } from "../theme/lapormasTheme";

const INITIAL_REGION = {
  latitude: -2.5,
  longitude: 118,
  latitudeDelta: 14,
  longitudeDelta: 14,
};

export default function CreateReportScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
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

  const pickImageFromGallery = async () => {
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

  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin", "Akses kamera diperlukan untuk mengambil foto.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
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
    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("category_id", String(categoryId));
      if (location.trim()) form.append("location", location.trim());
      if (coords) {
        form.append("latitude", String(coords.latitude));
        form.append("longitude", String(coords.longitude));
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
        Sampaikan pengaduan dengan jelas beserta foto bukti agar cepat ditindaklanjuti.
      </Text>

      <View style={styles.panel}>
        <Text style={styles.sectionLabel}>Kategori Pengaduan *</Text>
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

        <Text style={styles.sectionLabel}>Judul Laporan *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Contoh: Jalan berlubang di depan Stasiun"
          placeholderTextColor={theme.overlay}
          maxLength={200}
        />
        <Text style={styles.counter}>{title.length}/200</Text>

        <Text style={styles.sectionLabel}>Deskripsi Lengkap *</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Jelaskan detail kejadian, waktu, dan dampaknya pada warga..."
          placeholderTextColor={theme.overlay}
          multiline
        />

        <Text style={styles.sectionLabel}>Lokasi di peta (opsional)</Text>
        <Text style={styles.mapHint}>
          Ketuk peta untuk menandai titik kejadian. Seret pin jika perlu.
        </Text>
        <MapView
          style={styles.map}
          initialRegion={INITIAL_REGION}
          onPress={(e) => setCoords(e.nativeEvent.coordinate)}
        >
          {coords ? (
            <Marker
              coordinate={coords}
              draggable
              onDragEnd={(e) => setCoords(e.nativeEvent.coordinate)}
            />
          ) : null}
        </MapView>

        <Text style={[styles.sectionLabel, styles.sectionAfterMap]}>
          Keterangan Alamat / Patokan (opsional)
        </Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Contoh: Di depan halte busway"
          placeholderTextColor={theme.overlay}
        />

        <Text style={styles.sectionLabel}>Foto Bukti (.PNG, .JPG, .WEBP) *</Text>
        {image?.uri ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: image.uri }} style={styles.preview} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
              <Text style={styles.removeTxt}>✕ Hapus Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={takePhotoWithCamera}>
              <Text style={styles.pickBtnIcon}>📷</Text>
              <Text style={styles.pickBtnTxt}>Ambil Foto Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={pickImageFromGallery}>
              <Text style={styles.pickBtnIcon}>🖼️</Text>
              <Text style={styles.pickBtnTxt}>Pilih Dari Galeri</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>💡 Panduan Laporan Efektif</Text>
        <Text style={styles.tipsLine}>• Judul spesifik dan kategori tepat</Text>
        <Text style={styles.tipsLine}>• Sertakan bukti foto yang jelas (.PNG / .JPG)</Text>
        <Text style={styles.tipsLine}>• Jelaskan dampak bagi warga sekitar</Text>
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
            <Text style={styles.btnSubmitText}>📤 Kirim Laporan</Text>
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
    marginTop: 8,
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
    fontSize: 15,
    color: theme.text,
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
    marginBottom: 8,
    lineHeight: 17,
  },
  map: {
    width: "100%",
    height: 220,
    borderRadius: theme.radiusSm,
    overflow: "hidden",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: theme.surface2,
  },
  sectionAfterMap: {
    marginTop: 12,
  },
  pickerRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  pickBtn: {
    flex: 1,
    backgroundColor: theme.surface1,
    borderWidth: 1,
    borderColor: theme.surface2,
    borderStyle: "dashed",
    borderRadius: theme.radiusSm,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pickBtnIcon: { fontSize: 28, marginBottom: 6 },
  pickBtnTxt: { fontSize: 13, fontWeight: "700", color: theme.text, textAlign: "center" },
  imageWrap: {
    borderRadius: theme.radiusSm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.surface2,
  },
  preview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  removeBtn: {
    backgroundColor: "rgba(243, 139, 168, 0.2)",
    padding: 10,
    alignItems: "center",
  },
  removeTxt: {
    color: theme.red,
    fontSize: 13,
    fontWeight: "700",
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
    backgroundColor: theme.blue,
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
