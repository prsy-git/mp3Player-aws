import { useState, useRef } from 'react';

//define type/interface to allow import of prop
interface UploadFormProps {
    onUploadSuccess: () => void;
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
    //create useState to hold selected file and status for reporting string
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<String>('');

    //reference native DOM input
    const fileInputDummy = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    };

    const handleUpload = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setStatus('Uploading...');
            const res = await fetch('http://localhost:5000/api/songs/upload', { //check if correct path
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (res.ok) {
                setStatus('Upload Successful.')
                onUploadSuccess();
                
                //clear react state
                setFile(null);

                //have browser display native null value
                if (fileInputDummy.current) { //is not null
                    fileInputDummy.current.value = '';
                }
            }
            else setStatus('Upload failed.');

        } catch (err) {
            setStatus('Error occured');
        }
    }

    //on click function to help conditional display of the clear file selection button
    const handleClear = () => {
        setFile(null);
        setStatus('');
        if (fileInputDummy.current) { //browser storage is not null
            fileInputDummy.current.value = '';
        }
    }

    //ret creates the form
    return (
        <form onSubmit={handleUpload}>
            <input ref={fileInputDummy} type="file" onChange={handleFileChange} />
            <button type="submit">Upload</button>
            {file && <button type="button" onClick={handleClear}>Clear</button>}
            <p>{status}</p>
        </form>
    )
};