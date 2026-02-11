import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
} from "react-native";

// ============================================
// TIPE DATA (TypeScript)
// ============================================
// Interface = blueprint untuk object
interface Note {
  id: string;
  judul: string;
  isi: string;
  waktu: string;
}

// Props untuk komponen TombolCustom
interface TombolCustomProps {
  text: string;
  warna: string;
  onTekan: () => void; // void = tidak return apa-apa
}

// Props untuk komponen ItemNote
interface ItemNoteProps {
  note: Note;
  onHapus: (id: string) => void;
}

// ============================================
// KOMPONEN 1: Tombol Custom (Belajar PROPS)
// ============================================
function TombolCustom({ text, warna, onTekan }: TombolCustomProps) {
  // Destructuring props langsung di parameter
  return (
    <TouchableOpacity
      style={[styles.tombol, { backgroundColor: warna }]}
      onPress={onTekan}
    >
      <Text style={styles.textTombol}>{text}</Text>
    </TouchableOpacity>
  );
}

// ============================================
// KOMPONEN 2: Item Note (Belajar PROPS)
// ============================================
function ItemNote({ note, onHapus }: ItemNoteProps) {
  return (
    <View style={styles.itemNote}>
      <View style={styles.isiNote}>
        <Text style={styles.judulNote}>{note.judul}</Text>
        <Text style={styles.isiNoteTeks}>{note.isi}</Text>
        <Text style={styles.waktu}>{note.waktu}</Text>
      </View>

      <TouchableOpacity
        onPress={() => onHapus(note.id)}
        style={styles.tombolHapus}
      >
        <Text style={styles.textHapus}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// KOMPONEN UTAMA: NotepadApp (Belajar HOOKS & useState)
// ============================================
export default function NotepadApp() {
  // ============================================
  // BAGIAN useState - MENGELOLA DATA
  // ============================================

  // State 1: Array Note (dengan tipe Note[])
  const [notes, setNotes] = useState<Note[]>([]);

  // State 2: String untuk judul
  const [judul, setJudul] = useState<string>("");

  // State 3: String untuk isi
  const [isi, setIsi] = useState<string>("");

  // ============================================
  // FUNGSI: Tambah Note Baru
  // ============================================
  const tambahNote = (): void => {
    // Validasi
    if (judul.trim() === "" || isi.trim() === "") {
      Alert.alert("Peringatan", "Judul dan isi note tidak boleh kosong!");
      return;
    }

    // Buat object note baru sesuai interface Note
    const noteBaru: Note = {
      id: Date.now().toString(),
      judul: judul,
      isi: isi,
      waktu: new Date().toLocaleString("id-ID"),
    };

    // Tambahkan ke array dengan spread operator
    setNotes([noteBaru, ...notes]);

    // Reset form
    setJudul("");
    setIsi("");

    Alert.alert("Berhasil", "Note berhasil disimpan!");
  };

  // ============================================
  // FUNGSI: Hapus Note
  // ============================================
  const hapusNote = (id: string): void => {
    Alert.alert("Konfirmasi", "Yakin ingin menghapus note ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          // Filter: ambil semua kecuali yang dihapus
          const notesBaru = notes.filter((note) => note.id !== id);
          setNotes(notesBaru);
        },
      },
    ]);
  };

  // ============================================
  // RENDER UI
  // ============================================
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.judul}>📝 Notepad Saya</Text>
        <Text style={styles.subjudul}>Total: {notes.length} note</Text>
      </View>

      {/* FORM INPUT */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Judul note..."
          value={judul}
          onChangeText={setJudul}
        />

        <TextInput
          style={[styles.input, styles.inputIsi]}
          placeholder="Tulis note Anda di sini..."
          value={isi}
          onChangeText={setIsi}
          multiline
          numberOfLines={4}
        />

        {/* Komponen dengan PROPS */}
        <TombolCustom
          text="💾 Simpan Note"
          warna="#4CAF50"
          onTekan={tambahNote}
        />
      </View>

      {/* DAFTAR NOTE */}
      <View style={styles.listContainer}>
        <Text style={styles.labelList}>Daftar Note:</Text>

        {notes.length === 0 ? (
          <Text style={styles.kosong}>
            Belum ada note. Yuk buat note pertama!
          </Text>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ItemNote note={item} onHapus={hapusNote} />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2196F3",
    padding: 20,
    paddingTop: 40,
  },
  judul: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  subjudul: {
    fontSize: 14,
    color: "white",
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: "white",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  inputIsi: {
    height: 100,
    textAlignVertical: "top",
  },
  tombol: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  textTombol: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    flex: 1,
    padding: 10,
  },
  labelList: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  kosong: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#999",
  },
  itemNote: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  isiNote: {
    flex: 1,
  },
  judulNote: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  isiNoteTeks: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  waktu: {
    fontSize: 12,
    color: "#999",
  },
  tombolHapus: {
    justifyContent: "center",
    paddingLeft: 10,
  },
  textHapus: {
    fontSize: 24,
  },
});
