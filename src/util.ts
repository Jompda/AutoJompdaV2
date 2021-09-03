import fs from 'fs'
import path from 'path'


function forEachFile(currentPath: string, filter = (filepath: string, filename: string) => true, predicate: (filepath: string) => any) {
    for (let tempFile of fs.readdirSync(currentPath)) {
        const tempPath = path.resolve(currentPath, tempFile)
        if (fs.statSync(tempPath).isDirectory()) forEachFile(tempPath, filter, predicate)
        else if (filter(tempPath, tempFile)) predicate(tempPath)
    }
}


export {
    forEachFile
}
