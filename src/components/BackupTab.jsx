import { useState } from 'react';
import { exportDB, importDB, peakImportFile } from 'dexie-export-import';
import { saveAs } from 'file-saver';

import { Button, Input, addToast } from '@heroui/react';
import db from '../assets/db';

function BackupTab() {

    const [backup, setBackup] = useState(null);

    const exportDatabase = async () => {
        try {
            // Экспортируем базу данных
            const blob = await exportDB(db, { prettyJson: true }); // prettyJson для читаемости
            addToast({
                title: 'Экспорт базы данных',
                description: `Сохранено в папке "Загрузки"`,
                color: 'primary',
                timeout: 5000
            });
            saveAs(blob, 'agreements_backup.json');
        } catch (error) {
            addToast({
                title: 'Экспорт базы данных',
                description: `Ошибка экспорта: ${error.message}`,
                color: 'danger',
                timeout: 5000
            });
        }
    }

    const importDatabase = async () => {
        if (!backup) {
            addToast({
                title: 'Импорт базы данных',
                description: `Выберите файл для импорта!`,
                color: 'warning',
                timeout: 5000
            });
            return;
        }
        try {
            const importMeta = await peakImportFile(backup);
            if (!importMeta || importMeta.formatName !== 'dexie') {
                addToast({
                    title: 'Импорт базы данных',
                    description: `Неверный формат файла!`,
                    color: 'danger',
                    timeout: 5000
                });
                return;
            }
            // Импортируем базу данных
            // Импортируем поверх (добавить новые записи, обновить существующие по ключу)
            const result = await importDB(backup, { overwriteValues: true });
            if (result) {
                addToast({
                    title: 'Импорт базы данных',
                    description: `Данные успешно импортированы!`,
                    color: 'success',
                    timeout: 5000
                });
            }
        } catch (error) {
            addToast({
                title: 'Импорт базы данных',
                description: `Ошибка импорта: ${error.message}`,
                color: 'danger',
                timeout: 5000
            });
        }
    }

    return (
        <>
            <div className='font-bold'>Нажмите кнопку для создания резервной копии: </div>
            <div className="grid w-full grid-cols-4 gap-4 mt-4">
                <Button
                    onPress={exportDatabase}
                    className='col-span-4'
                >
                    Создать резервную копию
                </Button>
                <div className='col-span-4 font-bold'>или выберите файл для импорта:</div>
                <Input
                    isClearable
                    className='col-span-2 cursor-pointer'
                    type="file"
                    accept='.json'
                    onChange={(e) => setBackup(e.target.files[0])}
                />
                <Button
                    onPress={importDatabase}
                    className='col-span-2'
                >
                    Импортировать резервную копию
                </Button>
            </div>
        </>

    );
}

export default BackupTab