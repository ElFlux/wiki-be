import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Article } from '../articles/articles.entity';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id!: number; // Primary key

    @Column('text')
    content!: string; // Comment text

    @CreateDateColumn()
    created_at!: Date; // Timestamp for creation

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true, eager: false })
    @JoinColumn({ name: 'user_id' })
    user: User | null = null; // Comment author (optional)

    @ManyToOne(() => Article, (article) => article.comments, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'article_id' })
    article!: Article; // Associated article
}
