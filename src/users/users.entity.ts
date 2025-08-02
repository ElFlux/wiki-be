import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Article } from '../articles/articles.entity';

@Entity('users') // define "users" table
export class User {
    @PrimaryGeneratedColumn()
    id!: number; // primary key

    @Column({ unique: true })
    email!: string; // unique email

    @Column()
    password!: string; // hashed password

    @Column({ unique: true })
    username!: string; // unique username

    @Column({ default: 'user' })
    role!: 'user' | 'admin'; // role, default "user"

    @OneToMany(() => Article, (article) => article.user)
    articles!: Article[]; // articles created by user
}
