import { integer, text, boolean, pgTable, serial, date } from "drizzle-orm/pg-core";

export const organisations = pgTable("organisations", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    country: text("country").notNull(),
    created_at: date("created_at").defaultNow(),
    update_at: date("update_at").defaultNow(),
    statut: boolean("statut").default(true),
});

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    firebase_uid: text("firebase_uid").notNull().unique(),
    organisations_id: integer("organisations_id").references(() => organisations.id).notNull(),
    first_name: text("first_name").notNull(),
    countryCode: text("countryCode").notNull(),
    last_name: text("last_name").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(), 
    email: text("email").notNull().unique(),
    
    role: text("role").notNull(),
    
    created_at: date("created_at").defaultNow(),
    update_at: date("update_at").defaultNow(),
    
    location: text("location"),
    photo_url: text("photo_url"),
});

export const documents = pgTable("documents", {
    id: serial("id").primaryKey(),
    organisations_id: integer("organisations_id").references(() => organisations.id).notNull(),
    users_id: integer("users_id").references(() => users.id).notNull(), 
    name: text("name").notNull(),
    type: text("type").notNull(),
    size: integer("size").notNull(),
    file_url: text("file_url").notNull().unique(),
    content: text("content").notNull(),
    classe: text("classe").notNull(),
    statut: text("statut").default('actif'),
    created_at: date("created_at").defaultNow(),
    update_at: date("update_at").defaultNow(),
});
export const folder = pgTable("folder", {
    id: serial("id").primaryKey(),
    organisations_id: integer("organisations_id").references(() => organisations.id).notNull(),
    users_id: integer("users_id").references(() => users.id).notNull(), 
    name: text("name").notNull(),
    documents_id: integer("documents_id").references(() => documents.id).notNull(),
    size: integer("size").notNull(),
    classe: text("classe").notNull(),
    statut: text("statut").default('actif'),
    created_at: date("created_at").defaultNow(),
    update_at: date("update_at").defaultNow(),
});

export const document_metadata = pgTable("document_metadata", {
    id: serial("id").primaryKey().notNull(),
    documents_id: integer("documents_id").references(() => documents.id).notNull(),
    created_at: date("created_at").defaultNow(),
    update_at: date("update_at").defaultNow(),
});

export const roles = pgTable("roles", {
    id: serial("id").primaryKey().notNull(),
    name: text("name").unique().notNull(),
    description: text("description").notNull(),
});

export const user_roles = pgTable("user_roles", {
    id: serial("id").primaryKey().notNull(),
    users_id: integer("users_id").references(() => users.id).notNull(),
    roles_id: integer("roles_id").references(() => roles.id).notNull(),
});

export const logs = pgTable("logs", {
    id: serial("id").primaryKey().notNull(),
    users_id: integer("users_id").references(() => users.id).notNull(), 
    action: text("action").notNull(),
    description: text("description").notNull(),
    created_at: date("created_at").defaultNow(),
});

export const document_versions = pgTable("document_versions", {
    id: serial("id").primaryKey().notNull(),
    documents_id: integer("documents_id").references(() => documents.id).notNull(),
    file_url: text("file_url").notNull(),
    version_number: integer("version_number").notNull(),
    created_at: date("created_at").defaultNow(),
    upload_at: date("upload_at").defaultNow(),
});

export const document_shared = pgTable("document_shared", {
    id: serial("id").primaryKey().notNull(),
    documents_id: integer("documents_id").references(() => documents.id).notNull(),
    shared_with_user_id: integer("shared_with_user_id").references(() => users.id).notNull(), 
    permission: text("permission").notNull().default('view'),
    created_at: date("created_at").defaultNow(),
});

export const notification = pgTable("notification", {
    id: serial("id").primaryKey().notNull(),
    users_id: integer("users_id").references(() => users.id).notNull(), 
    message: text("message").notNull(),
    created_at: date("created_at").defaultNow(),
});
