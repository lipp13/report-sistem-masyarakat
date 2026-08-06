import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import api from "../api/client";
import { API_ROOT } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme/lapormasTheme";

function parseCoord(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const statusStyle = {
  pending: { color: theme.yellow, bg: "rgba(249, 226, 175, 0.15)", icon: "⏳", label: "Menunggu Verifikasi" },
  in_progress: { color: theme.teal, bg: "rgba(148, 226, 213, 0.15)", icon: "⚡", label: "Sedang Diproses" },
  resolved: { color: theme.green, bg: "rgba(166, 227, 161, 0.15)", icon: "✅", label: "Selesai Ditangani" },
  approved: { color: theme.green, bg: "rgba(166, 227, 161, 0.15)", icon: "✅", label: "Disetujui" },
  rejected: { color: theme.red, bg: "rgba(243, 139, 168, 0.15)", icon: "❌", label: "Ditolak / Tidak Valid" },
};

export default function ReportDetailScreen({ route }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [voting, setVoting] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/reports/${id}`);
      setReport(res.data.data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [id]),
  );

  const handleVote = async () => {
    if (voting) return;
    setVoting(true);
    try {
      const res = await api.post(`/reports/${id}/vote`);
      if (res.data?.success) {
        setReport((prev) => ({
          ...prev,
          votes_count: res.data.data.votes_count,
          has_voted: res.data.data.has_voted,
        }));
      }
    } catch {
      // Ignore
    } finally {
      setVoting(false);
    }
  };

  const sendComment = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      await api.post(`/reports/${id}/comments`, { content: comment.trim() });
      setComment("");
      await load();
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

  if (loading && !report) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.blue} size="large" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.centered}>
        <Text style={styles.err}>Laporan tidak ditemukan</Text>
      </View>
    );
  }

  const imgUri = report.image_url ? `${API_ROOT}${report.image_url}` : null;
  const st = statusStyle[report.status] || statusStyle.pending;

  const lat = parseCoord(report.latitude);
  const lng = parseCoord(report.longitude);
  const hasCoords = lat !== null && lng !== null;
  const showLocationSection = Boolean(report.location || hasCoords);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.inner}>
      {imgUri ? (
        <View style={styles.heroImgWrap}>
          <Image source={{ uri: imgUri }} style={styles.heroImg} />
        </View>
      ) : null}

      <View style={styles.panel}>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.catPill,
              {
                backgroundColor: (report.category?.color || theme.blue) + "30",
              },
            ]}
          >
            <Text
              style={[
                styles.catTxt,
                { color: report.category?.color || theme.peach },
              ]}
            >
              {report.category?.icon} {report.category?.name}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusTxt, { color: st.color }]}>
              {st.icon} {st.label}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{report.title}</Text>

        <View style={styles.authorRow}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarLgTxt}>
              {report.user?.name?.charAt(0) || "W"}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{report.user?.name || "Warga"}</Text>
            <Text style={styles.authorEmail}>Pelapor Pengaduan</Text>
          </View>

          <TouchableOpacity
            style={[styles.voteBtn, report.has_voted && styles.voteBtnActive]}
            onPress={handleVote}
          >
            <Text style={styles.voteTxt}>
              👍 Dukung ({report.votes_count || 0})
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.dateLbl}>Tanggal Pengaduan</Text>
        <Text style={styles.dateVal}>
          {new Date(report.created_at).toLocaleDateString("id-ID", {
            dateStyle: "long",
          })}
        </Text>

        {showLocationSection ? (
          <View style={styles.locSection}>
            <Text style={styles.secTitle}>📍 Lokasi kejadian</Text>
            {hasCoords ? (
              <>
                <MapView
                  style={styles.map}
                  scrollEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  zoomEnabled={false}
                  initialRegion={{
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                  }}
                >
                  <Marker coordinate={{ latitude: lat, longitude: lng }} />
                </MapView>
                {report.location ? (
                  <Text style={styles.mapCaption}>{report.location}</Text>
                ) : null}
              </>
            ) : (
              <View style={styles.locBox}>
                <Text style={styles.locTxt}>📍 {report.location}</Text>
              </View>
            )}
          </View>
        ) : null}

        <Text style={styles.secTitle}>Deskripsi laporan</Text>
        <Text style={styles.body}>{report.description}</Text>

        {report.admin_note ? (
          <View style={styles.adminBox}>
            <Text style={styles.adminTitle}>🛡️ Balasan Respon Petugas</Text>
            <Text style={styles.adminBody}>{report.admin_note}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.commentsHeading}>
          💬 Komentar ({report.comments?.length || 0})
        </Text>
        {(report.comments || []).length === 0 ? (
          <Text style={styles.noCom}>
            Belum ada komentar. Jadilah yang pertama!
          </Text>
        ) : null}
        {(report.comments || []).map((c) => {
          const isOfficial = c.user?.role === "admin" || c.user?.role === "super_admin";
          return (
            <View key={c.id} style={[styles.commentCard, isOfficial && styles.officialComment]}>
              <View style={styles.commentTop}>
                <View style={styles.commentAuthor}>
                  <View style={[styles.cAv, isOfficial && { backgroundColor: theme.blue }]}>
                    <Text style={[styles.cAvTxt, isOfficial && { color: theme.base }]}>{c.user?.name?.charAt(0) || "U"}</Text>
                  </View>
                  <View>
                    <Text style={styles.cName}>{c.user?.name}</Text>
                    {isOfficial ? (
                      <Text style={styles.cRole}>Petugas Resmi</Text>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.cDate}>
                  {new Date(c.created_at).toLocaleDateString("id-ID")}
                </Text>
              </View>
              <Text style={styles.cContent}>{c.content}</Text>
            </View>
          );
        })}

        {user ? (
          <View style={styles.composer}>
            <TextInput
              style={styles.composerInput}
              placeholder="Tulis komentar atau informasi tambahan..."
              placeholderTextColor={theme.overlay}
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!comment.trim() || sending) && styles.sendDisabled,
              ]}
              onPress={sendComment}
              disabled={sending || !comment.trim()}
            >
              <Text style={styles.sendBtnTxt}>{sending ? "..." : "Kirim Komentar"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.loginHint}>
            Silakan login untuk berkomentar.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.base },
  inner: { paddingBottom: 32 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.base,
    padding: 24,
  },
  err: { color: theme.red, fontSize: 16 },
  heroImgWrap: {
    borderBottomWidth: 1,
    borderBottomColor: theme.surface1,
  },
  heroImg: {
    width: "100%",
    height: 220,
    backgroundColor: theme.surface1,
    resizeMode: "cover",
  },
  panel: {
    padding: 16,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  catTxt: { fontSize: 13, fontWeight: "700" },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTxt: { fontSize: 12, fontWeight: "700" },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.text,
    lineHeight: 28,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarLg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.peach,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarLgTxt: { fontSize: 18, fontWeight: "800", color: theme.base },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: "700", color: theme.text },
  authorEmail: { fontSize: 12, color: theme.overlay, marginTop: 2 },
  voteBtn: {
    backgroundColor: theme.surface1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  voteBtnActive: {
    backgroundColor: "rgba(137, 180, 250, 0.25)",
    borderWidth: 1,
    borderColor: theme.blue,
  },
  voteTxt: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.blue,
  },
  dateLbl: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: theme.overlay,
  },
  dateVal: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.subtext0,
    marginTop: 4,
    marginBottom: 12,
  },
  locSection: {
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: theme.radiusSm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.surface1,
    backgroundColor: theme.surface1,
  },
  mapCaption: {
    marginTop: 8,
    fontSize: 13,
    color: theme.overlay,
    lineHeight: 18,
  },
  locBox: {
    alignSelf: "flex-start",
    backgroundColor: theme.surface1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radiusSm,
    marginBottom: 16,
  },
  locTxt: { fontSize: 14, color: theme.subtext0 },
  secTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: theme.blue,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    color: theme.text,
    lineHeight: 22,
  },
  adminBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "rgba(137, 180, 250, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(137, 180, 250, 0.3)",
    borderRadius: theme.radius,
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.blue,
    marginBottom: 6,
  },
  adminBody: { fontSize: 14, color: theme.text, lineHeight: 20 },
  commentsSection: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: theme.surface0,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.surface1,
  },
  commentsHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 12,
  },
  noCom: {
    textAlign: "center",
    color: theme.overlay,
    fontSize: 14,
    marginBottom: 12,
  },
  commentCard: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface1,
    borderRadius: 8,
  },
  officialComment: {
    backgroundColor: "rgba(137, 180, 250, 0.08)",
  },
  commentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  commentAuthor: { flexDirection: "row", alignItems: "center" },
  cAv: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cAvTxt: { fontSize: 12, fontWeight: "700", color: theme.text },
  cName: { fontSize: 13, fontWeight: "600", color: theme.text },
  cRole: {
    fontSize: 10,
    color: theme.blue,
    fontWeight: "700",
  },
  cDate: { fontSize: 11, color: theme.overlay },
  cContent: { fontSize: 14, color: theme.subtext0, lineHeight: 20 },
  composer: { marginTop: 12 },
  composerInput: {
    backgroundColor: theme.surface1,
    borderWidth: 1,
    borderColor: theme.surface2,
    borderRadius: theme.radiusSm,
    padding: 12,
    color: theme.text,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
  },
  sendBtn: {
    marginTop: 10,
    backgroundColor: theme.blue,
    paddingVertical: 12,
    borderRadius: theme.radiusSm,
    alignItems: "center",
  },
  sendDisabled: { opacity: 0.5 },
  sendBtnTxt: { color: theme.base, fontWeight: "800", fontSize: 14 },
  loginHint: {
    marginTop: 8,
    fontSize: 13,
    color: theme.overlay,
    fontStyle: "italic",
  },
});
