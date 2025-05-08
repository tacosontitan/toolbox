CREATE TABLE [dbo].[TimeEntries]
(
  [Id] INT NOT NULL PRIMARY KEY,
  [Category] NVARCHAR(50) NOT NULL,
  [Timestamp] DATETIME NOT NULL
)
