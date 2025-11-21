import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
  tableName: 'Antrian',
  timestamps: true,
})
export class Antrian extends Model<Antrian> {

  @PrimaryKey
  @AutoIncrement
  @Column
  id_antrian!: number;

  @Column
  no_antrian!: string;

  @Column({
    type: DataType.ENUM('waiting', 'called', 'skipped', 'finished'),
    defaultValue: 'waiting',
  })
  status!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  counter!: string | null;
}
