import { Message, Permissions } from 'discord.js'
import fs from 'fs'
import path from 'path'


function forEachFile(currentPath: string, filter = (filepath: string, filename: string) => true, predicate: (filepath: string) => any) {
    for (let tempFile of fs.readdirSync(currentPath)) {
        const tempPath = path.resolve(currentPath, tempFile)
        if (fs.statSync(tempPath).isDirectory()) forEachFile(tempPath, filter, predicate)
        else if (filter(tempPath, tempFile)) predicate(tempPath)
    }
}


function resolveMember(msg: Message, start = 0) {
    if (!msg.guild) throw new Error(`Cannot resolve member without a guild.`)
    const userId = resolveTagId(msg.content, start)
    return userId ? msg.guild.members.resolve(userId) : undefined
}


function resolveTagId(text: string, start = 0) {
    const results = /<(@!|@&|#)(\d{18})>/.exec(start ? text.slice(start) : text)
    return results && 2 in results ? results[2] : undefined
}


function stringifyPermission(value: bigint) {
    return Object.getOwnPropertyNames(Permissions.FLAGS)
        .find(flag => (Permissions.FLAGS as any)[flag] === value)
}


export {
    forEachFile,
    resolveMember,
    resolveTagId,
    stringifyPermission
}
