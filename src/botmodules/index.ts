import fs from 'fs'
import path from 'path'
import { addCommand } from '../commands'
import BotModule from '../structure/botmodule'


const botModules = new Array<BotModule>()


for (const moduleFile of fs.readdirSync(__dirname)) {
    const tempModulePath = path.resolve(__dirname, moduleFile)
    if (!fs.statSync(tempModulePath).isDirectory()) continue

    const moduleIndex = require(path.resolve(tempModulePath, 'index.js'))
    if (!('default' in moduleIndex) || !(moduleIndex.default instanceof BotModule))
        throw new Error(`Non-BotModule index file under "${tempModulePath}"!`)
    const botModule = moduleIndex.default as BotModule
    botModules.push(botModule)
}


export {
    botModules
}