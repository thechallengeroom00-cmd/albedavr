import styles from "./ron-vr.module.css";

export default function RonVrPage() {
  return (
    <main className={styles.shell}>
      <iframe
        className={styles.experience}
        src="/ron-vr-webxr.html"
        title="Ron VR Albeda NEXT Experience"
        allow="xr-spatial-tracking; fullscreen; autoplay"
        allowFullScreen
      />
    </main>
  );
}
