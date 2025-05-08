CREATE PROCEDURE [dbo].[RecordTimeEntry.sql]
  @Category NVARCHAR(50),
  @Timestamp DATETIMEOFFSET
AS
  INSERT INTO [dbo].[TimeEntries] (Category, Timestamp)
  VALUES (@Category, @Timestamp)
RETURN 0
