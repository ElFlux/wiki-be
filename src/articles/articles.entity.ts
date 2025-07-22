import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Comment } from "../comments/comments.entity";
import { User } from "../users/users.entity";

/* Article entity representing the 'articles' table */
@Entity('articles')
export class Article {
    @PrimaryGeneratedColumn()
    id!: number; // Primary key

    @Column()
    title!: string; // Article title

    @Column('text')
    content!: string; // Article content

    @Column('simple-array', { array: true, nullable: true })
    images?: string[]; // Optional array of image paths

    @CreateDateColumn()
    created_at!: Date; // Auto-set creation timestamp

    @UpdateDateColumn({ nullable: true })
    updated_at?: Date; // Auto-set last update timestamp

    @OneToMany(() => Comment, (comment) => comment.article)
    comments!: Comment[]; // Related comments

    @ManyToOne(() => User, (user) => user.articles, { eager: true })
    @JoinColumn({ name: 'userId' })
    user!: User; // Author of the article

    @ManyToOne(() => User, { eager: true, nullable: true })
    @JoinColumn({ name: 'updatedById' })
    updatedBy?: User; // Optional user who last updated the article
}
