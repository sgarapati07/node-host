/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    DataObject,
    DataObjectFactory,
} from "@fluidframework/aqueduct";
import { SharedMap } from "@fluidframework/map";
import { IFluidHandle } from "@fluidframework/core-interfaces";
import { getTinyliciousContainer } from '@fluidframework/get-tinylicious-container';
import { ContainerRuntimeFactoryWithDefaultDataStore } from "@fluidframework/aqueduct";
import { v4 as uuid } from "uuid";
import { getDefaultObjectFromContainer } from '@fluidframework/aqueduct';



export class Note extends DataObject {
    public notesMap : SharedMap | undefined;
 
    protected async initializingFirstTime() {
         this.createSharedMap("notes"); 
   
     }
 
     private createSharedMap(id: string): void {
         const map = SharedMap.create(this.runtime);
         this.root.set(id, map.handle);
     }
 
     protected async hasInitialized() {
         this.notesMap = await this.root.get<IFluidHandle<SharedMap>>("notes").get();              
         this.createNote("Note1")
         this.createEventListeners(this.notesMap);
     }
     private createEventListeners(sharedMap: SharedMap): void {
         sharedMap.on("valueChanged", () => {
             this.emit("change");
         });
     }
     public createNote = (text: string): void => {
         if (text) {
             
             const note =  {
                 text: "text of notes",
                 id : "1"
             };
             if(this.notesMap)
             this.notesMap.set(note.id, note);
         }
     }
 }
 
export const NotesInstantiationFactory = new DataObjectFactory(
    "Note",
    Note,
    [
        SharedMap.getFactory(),
    ],
    {},
);
  
export const NotesContainerFactory = new ContainerRuntimeFactoryWithDefaultDataStore(
    NotesInstantiationFactory,
    new Map([NotesInstantiationFactory.registryEntry])
  );




export async function start(): Promise<void> {
    try{
        const documentId = uuid();
    const createNew = true;
    console.log(documentId)
const container = await getTinyliciousContainer(documentId, NotesContainerFactory, createNew);
console.log("after con" + container.id)

// Get the Default Object from the Container
const defaultObject = await getDefaultObjectFromContainer<Note>(container);
console.log(defaultObject.notesMap?.get("1"))
if(defaultObject.notesMap)
console.log( "XXXXXXXXXXXXXXXXXXXXXXX" + defaultObject.notesMap.get("id").text);
    } catch{

    }
    
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();
