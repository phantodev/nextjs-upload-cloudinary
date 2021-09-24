import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import iconUpload from "../public/icon-upload.png";
import iconDrop from "../public/icon-drop.png";
import iconDelete from "../public/icon-delete.svg";
import iconPacman from "../public/pacman.svg";

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  // Função abaixo para quando o usuário selecionar a imagem de seu dispositivo, irá fazer alguma coisa.
  const onDrop = useCallback((acceptedFiles) => {
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

    acceptedFiles.forEach(async (acceptedFile) => {
      setLoading(true);
      const { signature, timestamp } = await getSignature();
      const formData = new FormData();
      formData.append("file", acceptedFile);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_KEY);

      const response = await fetch(url, {
        method: "post",
        body: formData,
      });
      const data = await response.json();

      setUploadedFiles((old) => [...old, data]);
      setLoading(false);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accepts: "image/*",
    multiple: false,
  });

  // Remove itens from uploadFiles State and DELETE file from CLOUDINARY
  async function handleRemoveFiles(public_id) {
    // Here will put all arrays again in uploadFile State where the public_id is different from parameter id.
    const newUploadedFiles = uploadedFiles.filter(
      (item) => item.public_id !== public_id
    );
    // Update STATE with new list
    setUploadedFiles(newUploadedFiles);
    // DESTROY FILE in Cloudinary
    const response = await fetch(`/api/destroy/${public_id}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
  }

  return (
    <div className={styles.container}>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : null}`}
      >
        <input {...getInputProps()} />
        {isDragActive && loading === false && (
          <div>
            <div>
              <Image src={iconDrop} alt="Icone Drop" />
            </div>
            <p>Pode soltar seu arquivo!</p>
          </div>
        )}
        {isDragActive === false && loading === false && (
          <div>
            <div>
              <Image src={iconUpload} alt="Icone Upload" />
            </div>
            <p>Arraste seus arquivos aqui!</p>
            <p className={styles.or}>ou</p>
            <button className={styles.btnUpload}>Escolha seus arquivos</button>
          </div>
        )}
        {loading && (
          <div>
            <div>
              <Image src={iconPacman} alt="Icone Pacman" width={150} />
              <p>Fazendo o upload</p>
            </div>
          </div>
        )}
      </div>
      <ul>
        {uploadedFiles.map((file) => (
          <li key={file.public_id} className={styles.listItems}>
            <div className={styles.wrapperIconName}>
              <div className={styles.iconFormat}>{file.format}</div>
              <div className={styles.nameFile}>
                <p>{file.original_filename + "." + file.format} </p>
                <p className={styles.size}>
                  {parseInt(Number(file.bytes) / 1024) + " kb"}
                </p>
              </div>
            </div>
            <div className={styles.iconDelete}>
              <Image
                src={iconDelete}
                alt="Icon Delete"
                onClick={() => handleRemoveFiles(file.public_id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function getSignature() {
  const response = await fetch("/api/sign");
  const data = await response.json();
  const { signature, timestamp } = data;
  return { signature, timestamp };
}
