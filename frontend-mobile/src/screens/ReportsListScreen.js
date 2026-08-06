import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/client";
import { API_ROOT } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme/lapormasTheme";

const statusStyle = {
  pending: { color: theme.yellow, bg: "rgba(249, 226, 175, 0.15)", icon: "⏳", label: "Menunggu" },
  in_progress: { color: theme.teal, bg: "rgba(148, 226, 213, 0.15)", icon: "⚡", label: "Diproses" },
  resolved: { color: theme.green, bg: "rgba(166, 227, 161, 0.15)", icon: "✅", label: "Selesai" },
  approved: { color: theme.green, bg: "rgba(166, 227, 161, 0.15)", icon: "✅", label: "Disetujui" },
  rejected: { color: theme.red, bg: "rgba(243, 139, 168, 0.15)", icon: "❌", label: "Ditolak" },
};

export default function ReportsListScreen({ navigation }) {
  const { logout, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/reports", { params: { limit: 50 } });
      setItems(res.data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleVote = async (reportId) => {
    try {
      const res = await api.post(`/reports/${reportId}/vote`);
      if (res.data?.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === reportId
              ? {
                  ...item,
                  votes_count: res.data.data.votes_count,
                  has_voted: res.data.data.has_voted,
                }
              : item
          )
        );
      }
    } catch {
      // Ignore error
    }
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.blue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <View style={styles.navTop}>
          <View style={styles.brandRow}>
            <Text style={styles.brandIcon}>🏛️</Text>
            <View>
              <Text style={styles.brand}>LaporMas</Text>
              <Text style={styles.tagline}>Pengaduan Masyarakat</Text>
            </View>
          </View>
          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.btnNew}
              onPress={() => navigation.navigate("CreateReport")}
            >
              <Text style={styles.btnNewText}>+ Buat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOut} onPress={logout}>
              <Text style={styles.btnOutText}>Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.greet}>
          Halo, <Text style={styles.greetName}>{user?.name}</Text>
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.blue}
          />
        }
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Belum Ada Laporan</Text>
            <Text style={styles.emptySub}>
              Tap &quot;+ Buat&quot; untuk mengirim laporan pengaduan pertama.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const st = statusStyle[item.status] || statusStyle.pending;
          const img = item.image_url ? `${API_ROOT}${item.image_url}` : null;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("ReportDetail", { id: item.id })
              }
              activeOpacity={0.88}
            >
              {img ? (
                <Image source={{ uri: img }} style={styles.cardImg} />
              ) : (
                <View style={styles.cardImgPh}>
                  <Text style={styles.cardImgPhIcon}>
                    {item.category?.icon || "📋"}
                  </Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <View style={styles.cardMeta}>
                  <View
                    style={[
                      styles.catPill,
                      {
                        backgroundColor:
                          (item.category?.color || theme.blue) + "28",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.catText,
                        { color: item.category?.color || theme.peach },
                      ]}
                    >
                      {item.category?.icon} {item.category?.name}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.color }]}>
                      {st.icon} {st.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.cardFoot}>
                  <View style={styles.author}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarTxt}>
                        {item.user?.name?.charAt(0) || "W"}
                      </Text>
                    </View>
                    <Text style={styles.authorName}>{item.user?.name}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.voteBtn,
                      item.has_voted && styles.voteBtnActive,
                    ]}
                    onPress={() => handleVote(item.id)}
                  >
                    <Text style={styles.voteTxt}>
                      👍 {item.votes_count || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.base,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.base,
  },
  nav: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: theme.mantle,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface1,
  },
  navTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: { fontSize: 28 },
  brand: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.text,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 12,
    color: theme.subtext0,
    marginTop: 2,
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnNew: {
    backgroundColor: theme.blue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radiusSm,
    marginRight: 8,
  },
  btnNewText: {
    color: theme.base,
    fontWeight: "700",
    fontSize: 13,
  },
  btnOut: {
    borderWidth: 1,
    borderColor: theme.surface2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.surface0,
  },
  btnOutText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "600",
  },
  greet: {
    marginTop: 12,
    fontSize: 14,
    color: theme.subtext0,
  },
  greetName: {
    color: theme.text,
    fontWeight: "700",
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  emptyBox: {
    alignItems: "center",
    padding: 24,
    backgroundColor: theme.surface0,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.surface2,
  },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: theme.subtext0,
    textAlign: "center",
  },
  card: {
    backgroundColor: theme.surface0,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.surface1,
    marginBottom: 14,
    overflow: "hidden",
  },
  cardImg: {
    width: "100%",
    height: 150,
    backgroundColor: theme.surface1,
  },
  cardImgPh: {
    height: 120,
    backgroundColor: theme.surface1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImgPhIcon: { fontSize: 40 },
  cardBody: {
    padding: 14,
  },
  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  catPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  catText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  cardDesc: {
    fontSize: 13,
    color: theme.subtext0,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.surface1,
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.text,
  },
  authorName: {
    fontSize: 13,
    color: theme.subtext0,
    fontWeight: "500",
  },
  voteBtn: {
    backgroundColor: theme.surface1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voteBtnActive: {
    backgroundColor: "rgba(137, 180, 250, 0.25)",
    borderWidth: 1,
    borderColor: theme.blue,
  },
  voteTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.blue,
  },
});
